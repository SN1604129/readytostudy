import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { assertGoogleFlow, consumeGoogleFlow, prepareGoogleSignIn, verifyGoogleIdentity } from "../lib/google-auth.ts";
import { findOrCreateGoogleUser } from "../lib/google-users.ts";
import { authReturnPath } from "../lib/auth-return.ts";
import { readDocument, writeDocument } from "../lib/persistent-data.ts";

const clientId = "unit-test.apps.googleusercontent.com";
const pair = await generateKeyPair("RS256");
const jwk = { ...await exportJWK(pair.publicKey), kid: "unit-test", alg: "RS256" };
const keys = createLocalJWKSet({ keys: [jwk] });
async function isolated(run: () => Promise<void>) {
  const names = ["RTS_DATA_DIR", "DATABASE_URL", "POSTGRES_URL", "VERCEL", "AWS_LAMBDA_FUNCTION_NAME", "GOOGLE_CLIENT_ID"];
  const saved = names.map(name => process.env[name]);
  const directory = mkdtempSync(path.join(tmpdir(), "rts-google-"));
  names.forEach(name => delete process.env[name]); process.env.RTS_DATA_DIR = directory; process.env.GOOGLE_CLIENT_ID = clientId;
  try { await run(); } finally { names.forEach((name, i) => saved[i] === undefined ? delete process.env[name] : process.env[name] = saved[i]); rmSync(directory, { recursive: true, force: true }); }
}
function token(nonce: string, changes: Record<string, unknown> = {}) {
  return new SignJWT({ email: "student@gmail.com", email_verified: true, name: "Google Student", nonce, ...changes })
    .setProtectedHeader({ alg: "RS256", kid: "unit-test" }).setIssuer("https://accounts.google.com").setAudience(clientId).setSubject("google-subject").setIssuedAt().setExpirationTime("10m").sign(pair.privateKey);
}

test("Google credentials require a genuine signature, correct audience/issuer, current expiry and verified email", () => isolated(async () => {
  const flow = await prepareGoogleSignIn("/contact");
  const identity = await verifyGoogleIdentity(await token(flow.nonce), keys);
  assert.equal(identity.email, "student@gmail.com");
  await assert.rejects(verifyGoogleIdentity(await token(flow.nonce, { email_verified: false }), keys));
  await assert.rejects(verifyGoogleIdentity(await token(flow.nonce, { azp: "other-client" }), keys));
  const expired = await new SignJWT({ email: "student@gmail.com", email_verified: true, nonce: flow.nonce }).setProtectedHeader({ alg: "RS256", kid: "unit-test" }).setIssuer("https://accounts.google.com").setAudience(clientId).setSubject("subject").setIssuedAt().setExpirationTime(Math.floor(Date.now() / 1000) - 60).sign(pair.privateKey);
  await assert.rejects(verifyGoogleIdentity(expired, keys));
  const wrongAudience = await new SignJWT({ email: "student@gmail.com", email_verified: true, nonce: flow.nonce }).setProtectedHeader({ alg: "RS256", kid: "unit-test" }).setIssuer("https://accounts.google.com").setAudience("another-app").setSubject("subject").setIssuedAt().setExpirationTime("10m").sign(pair.privateKey);
  await assert.rejects(verifyGoogleIdentity(wrongAudience, keys));
  const wrongIssuer = await new SignJWT({ email: "student@gmail.com", email_verified: true, nonce: flow.nonce }).setProtectedHeader({ alg: "RS256", kid: "unit-test" }).setIssuer("https://other.example").setAudience(clientId).setSubject("subject").setIssuedAt().setExpirationTime("10m").sign(pair.privateKey);
  await assert.rejects(verifyGoogleIdentity(wrongIssuer, keys));
  const other = await generateKeyPair("RS256");
  const forged = await new SignJWT({}).setProtectedHeader({ alg: "RS256", kid: "unit-test" }).sign(other.privateKey);
  await assert.rejects(verifyGoogleIdentity(forged, keys));
}));

test("Google nonce is bound to one browser, expires and can only be consumed once", () => isolated(async () => {
  const flow = await prepareGoogleSignIn("/contact", 1000);
  const other = await prepareGoogleSignIn("/student", 1000);
  const stored = JSON.stringify(await readDocument("google-signins", []));
  assert.ok(!stored.includes(flow.binding) && !stored.includes(flow.nonce));
  await assert.rejects(consumeGoogleFlow(other.binding, flow.nonce, 1001));
  assert.equal(await consumeGoogleFlow(flow.binding, flow.nonce, 1001), "/contact");
  await assert.rejects(consumeGoogleFlow(flow.binding, flow.nonce, 1002));
  await assert.rejects(assertGoogleFlow(other.binding, 602000));
}));

test("Google registration always creates a student and returning users keep the same account", () => isolated(async () => {
  const identity = { subject: "google-subject", email: "student@gmail.com", name: "Google Student", nonce: "a".repeat(64) };
  const first = await findOrCreateGoogleUser(identity);
  assert.equal(first.user.role, "student"); assert.equal(first.user.passwordHash, undefined); assert.ok(first.user.emailVerifiedAt);
  const next = await findOrCreateGoogleUser({ ...identity, email: "renamed@gmail.com" });
  assert.equal(next.created, false); assert.equal(next.user.id, first.user.id); assert.equal(next.user.email, "renamed@gmail.com");
  assert.equal((await readDocument<unknown[]>("users", [])).length, 1);
}));

test("a matching email cannot take over a password account or inherit administrator access", () => isolated(async () => {
  const existing = { id: "a".repeat(32), email: "admin@gmail.com", role: "admin", passwordHash: "existing-password", name: "Owner", createdAt: new Date().toISOString() };
  await writeDocument("users", [existing]);
  await assert.rejects(findOrCreateGoogleUser({ subject: "different-google-subject", email: existing.email, name: "Google User", nonce: "a".repeat(64) }), /existing password/);
  assert.deepEqual(await readDocument("users", []), [existing]);
}));

test("authentication return paths reject external URLs, API paths and host tricks", () => {
  for (const path of ["https://evil.example", "//evil.example", "/\\evil.example", "/api/admin/events", "/admin", "/login"]) assert.equal(authReturnPath(path), "/student");
  assert.equal(authReturnPath("/contact"), "/contact");
  assert.equal(authReturnPath("/course-finder?destination=canada"), "/course-finder?destination=canada");
});
