import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { decodeStoredDocument, readDocument, mutateDocument, writeDocument } from "../lib/persistent-data.ts";
import { CloudAdvisorStore } from "../lib/advisor/cloud-store.ts";

const start = Date.UTC(2026, 9, 25);
test("legacy double-encoded JSONB is read compatibly with native arrays and objects", () => {
  assert.deepEqual(decodeStoredDocument('[{"id":"existing-account"}]'), [{ id: "existing-account" }]);
  assert.deepEqual(decodeStoredDocument('{"count":3}'), { count: 3 });
  assert.deepEqual(decodeStoredDocument([{ id: "native-account" }]), [{ id: "native-account" }]);
  assert.equal(decodeStoredDocument("plain string"), "plain string");
});
async function isolated(run: () => Promise<void>) {
  const keys = ["RTS_DATA_DIR", "DATABASE_URL", "POSTGRES_URL", "VERCEL", "AWS_LAMBDA_FUNCTION_NAME"];
  const saved = keys.map(key => process.env[key]);
  const directory = mkdtempSync(path.join(tmpdir(), "rts-data-"));
  keys.forEach(key => delete process.env[key]);
  process.env.RTS_DATA_DIR = directory;
  try { await run(); }
  finally { keys.forEach((key, i) => saved[i] === undefined ? delete process.env[key] : process.env[key] = saved[i]); rmSync(directory, { recursive: true, force: true }); }
}

test("document mutations preserve concurrent updates and roll back rejected changes", () => isolated(async () => {
  await Promise.all(Array.from({ length: 30 }, (_, i) => mutateDocument<number[], void>("records", [], values => ({ value: [...values, i], result: undefined }))));
  assert.equal((await readDocument<number[]>("records", [])).length, 30);
  await assert.rejects(mutateDocument<number[], void>("records", [], values => { values.push(31); throw new Error("reject"); }), /reject/);
  assert.equal((await readDocument<number[]>("records", [])).length, 30);
}));

test("Vercel without a database cannot read bundled users or accept ephemeral writes", () => isolated(async () => {
  await writeDocument("users", [{ id: "local-only" }]);
  process.env.VERCEL = "1";
  assert.deepEqual(await readDocument("users", []), []);
  await assert.rejects(writeDocument("users", []), /storage is not configured/);
}));

test("cloud quota logic retains limits, duplicate protection and failed-call reservations", () => isolated(async () => {
  const first = new CloudAdvisorStore();
  const second = new CloudAdvisorStore();
  const input = (id: string) => ({ id, user: "student", ip: "network", tokens: 500, search: false });
  const attempts = await Promise.allSettled([first.reserve(input("one"), start), second.reserve(input("two"), start)]);
  assert.equal(attempts.filter(result => result.status === "fulfilled").length, 1);
  await first.finish("one", { reply: "saved" });
  assert.deepEqual(await second.previous("one", "student"), { reply: "saved" });
  assert.equal(await second.previous("one", "another-user"), null);
  await assert.rejects(second.reserve(input("one"), start + 61000), /already received/);
  for (let i = 1; i < 5; i++) { await second.reserve(input(`next-${i}`), start + i * 61000); await second.finish(`next-${i}`, {}); }
  assert.equal((await first.usage("student", start + 5 * 61000)).remaining, 0);
  await assert.rejects(first.reserve(input("six"), start + 5 * 61000), /five AI replies/);
  assert.equal((await first.overview(start + 5 * 61000)).tokens, 2500);
  assert.equal((await first.usage("student", start + 2 * 86400000)).remaining, 5);
}));

test("cloud search and token limits survive new store instances and cached sources expire", () => isolated(async () => {
  const store = new CloudAdvisorStore();
  await store.reserve({ id: "search", user: "a", ip: "", tokens: 7000, search: true }, start);
  await store.finish("search", {});
  await assert.rejects(store.reserve({ id: "tokens", user: "b", ip: "", tokens: 600, search: false }, start + 30000), /one minute/);
  await store.finish("search", {}, 100);
  await assert.rejects(new CloudAdvisorStore().reserve({ id: "search-again", user: "a", ip: "", tokens: 100, search: true }, start + 61000), /fresh-search allowance/);
  await store.cache("key", [{ url: "https://www.aut.ac.nz" }], start);
  assert.ok(await new CloudAdvisorStore().cached("key", start + 100));
  assert.equal(await store.cached("key", start + 86400001), null);
}));
