import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getAccount, getAccountHistory, parseJourneyCommand, recordActivity, recordEnquiryActivity, saveJourneyCommand } from "../lib/account-store.ts";
import { recordContactEnquiry, getUserEnquiries } from "../lib/contact-messages.ts";

async function isolated(run: () => Promise<void>) {
  const keys = ["RTS_DATA_DIR", "DATABASE_URL", "POSTGRES_URL", "VERCEL", "AWS_LAMBDA_FUNCTION_NAME"];
  const saved = keys.map(key => process.env[key]);
  const directory = mkdtempSync(path.join(tmpdir(), "rts-account-"));
  keys.forEach(key => delete process.env[key]); process.env.RTS_DATA_DIR = directory;
  try { await run(); } finally { keys.forEach((key, i) => saved[i] === undefined ? delete process.env[key] : process.env[key] = saved[i]); rmSync(directory, { recursive: true, force: true }); }
}
const a = "a".repeat(32), b = "b".repeat(32);

test("account commands survive reloads, retries cannot toggle twice and accounts stay separate", () => isolated(async () => {
  const id = randomUUID();
  await saveJourneyCommand(a, id, { type: "checklist", id: "passport" });
  await saveJourneyCommand(a, id, { type: "checklist", id: "passport" });
  await Promise.all([saveJourneyCommand(a, randomUUID(), { type: "patch", patch: { destination: "canada" } }), saveJourneyCommand(a, randomUUID(), { type: "save-course", course: { title: "Computing", university: "University", destination: "canada" } })]);
  assert.deepEqual((await getAccount(a)).journey.checklistDone, ["passport"]);
  assert.equal((await getAccount(a)).journey.savedCourses.length, 1);
  assert.equal((await getAccount(b)).journey.savedCourses.length, 0);
  assert.equal((await getAccountHistory(a)).activities.filter(item => item.id === id).length, 1);
  assert.equal((await getAccountHistory(b)).activities.length, 0);
}));

test("chat history restores real exchanges, pagination is stable and resetting a plan retains history", () => isolated(async () => {
  await recordActivity(a, { id: "chat-one", type: "chat", title: "Advisor conversation", exchange: { question: "Study in Canada?", reply: "Check reviewed courses.", sources: [] } });
  await recordActivity(a, { id: "chat-one", type: "chat", title: "Duplicate", exchange: { question: "Duplicate", reply: "Duplicate", sources: [] } });
  assert.equal((await getAccount(a)).conversation.length, 2);
  for (let i = 0; i < 35; i++) await recordActivity(a, { type: "visit", title: `Visit ${i}` });
  const first = await getAccountHistory(a);
  await recordActivity(a, { type: "visit", title: "New visit after pagination" });
  const next = await getAccountHistory(a, first.nextCursor!);
  assert.equal(first.activities.length, 30); assert.equal(next.activities.length, 6);
  assert.equal(next.activities.at(-1)!.id, "chat-one");
  await saveJourneyCommand(a, randomUUID(), { type: "reset" });
  assert.equal((await getAccount(a)).conversation.length, 2);
}));

test("enquiries are owned by an account, references cannot be reused across accounts and retries retain one activity", () => isolated(async () => {
  const data = { submissionId: randomUUID(), email: "student@example.com", fullName: "Student", destination: "Canada" };
  const enquiry = await recordContactEnquiry(data, a);
  await assert.rejects(recordContactEnquiry(data, b), /already used/);
  await recordEnquiryActivity(a, enquiry.id, `RTS-${enquiry.id.toUpperCase()}`, "Canada");
  await recordEnquiryActivity(a, enquiry.id, `RTS-${enquiry.id.toUpperCase()}`, "Canada");
  assert.equal((await getUserEnquiries(a)).length, 1); assert.equal((await getUserEnquiries(b)).length, 0);
  assert.equal((await getAccountHistory(a)).activities.length, 1);
  assert.equal((await getAccount(a)).journey.consultationRequested, true);
  await saveJourneyCommand(a, randomUUID(), { type: "reset" });
  assert.equal((await getAccount(a)).journey.consultationRequested, true);
}));

test("journey validation prevents writing ownership, consent or fabricated consultation history", () => {
  assert.throws(() => parseJourneyCommand({ type: "patch", patch: { userId: b } }));
  assert.throws(() => parseJourneyCommand({ type: "patch", patch: { consultationRequested: true } }));
  assert.throws(() => parseJourneyCommand({ type: "patch", patch: { budgetEstimate: { annualTotal: -1 } } }));
  assert.deepEqual(parseJourneyCommand({ type: "patch", patch: { destination: null } }), { type: "patch", patch: { destination: undefined } });
});
