import { test, expect } from "./fixtures";
import { importJWK, SignJWT } from "jose";
import { readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

async function credential(nonce: string, email: string, subject: string) {
  const fixture = JSON.parse(readFileSync(path.join(process.env.RTS_E2E_DATA_DIR!, "google-test-key.json"), "utf8"));
  const key = await importJWK(fixture.privateKey, "RS256");
  return new SignJWT({ email, email_verified: true, name: "Google Test Student", nonce, role: "admin" }).setProtectedHeader({ alg: "RS256", kid: "browser-test" }).setIssuer("https://accounts.google.com").setAudience("browser-test.apps.googleusercontent.com").setSubject(subject).setIssuedAt().setExpirationTime("10m").sign(key);
}

test("Google registration creates a student, restores the same account and records sign-in history", async ({ page }) => {
  const email = `google-${randomUUID()}@gmail.com`, subject = randomUUID();
  await page.goto("/signup?next=%2Fcontact");
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeVisible();
  let nonce = await page.evaluate(() => (window as unknown as { googleTestOptions: { nonce: string } }).googleTestOptions.nonce);
  let jwt = await credential(nonce, email, subject);
  await page.evaluate(value => { (window as unknown as { googleTestCredential: string }).googleTestCredential = value; }, jwt);
  await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  const first = (await (await page.request.get("/api/auth/me")).json()).user;
  expect(first.role).toBe("student"); expect(first.email).toBe(email); expect(first.googleSubject).toBeUndefined(); expect(first.passwordHash).toBeUndefined();
  expect((await page.request.get("/api/admin/readiness")).status()).toBe(403);
  expect((await page.request.post("/api/auth/google", { data: { credential: jwt } })).status()).toBe(400);
  await page.request.post("/api/auth/logout");
  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeVisible();
  nonce = await page.evaluate(() => (window as unknown as { googleTestOptions: { nonce: string } }).googleTestOptions.nonce);
  jwt = await credential(nonce, email, subject);
  await page.evaluate(value => { (window as unknown as { googleTestCredential: string }).googleTestCredential = value; }, jwt);
  await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
  await expect(page).toHaveURL(/\/student$/);
  expect((await (await page.request.get("/api/auth/me")).json()).user.id).toBe(first.id);
  await page.goto("/student/history");
  await expect(page.getByRole("heading", { name: "Account created with Google", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Logged in with Google", exact: true })).toBeVisible();
});

test("Google sign-in rejects forgery and cannot merge into a password administrator", async ({ request }) => {
  const email = `owner-${randomUUID()}@gmail.com`;
  await request.post("/api/auth/signup", { data: { name: "Password Owner", email, password: "Existing-password-824!", role: "admin", inviteCode: "test-only-admin-invite" } });
  await request.post("/api/auth/logout");
  expect((await request.post("/api/auth/google/prepare", { data: {}, headers: { Origin: "https://other.example" } })).status()).toBe(403);
  const { nonce } = await (await request.post("/api/auth/google/prepare", { data: { next: "//other.example" } })).json();
  expect((await request.post("/api/auth/google", { data: { credential: "forged.token.value" } })).status()).toBe(400);
  const jwt = await credential(nonce, email, randomUUID());
  const response = await request.post("/api/auth/google", { data: { credential: jwt, role: "admin" } });
  expect(response.status()).toBe(409);
  expect((await response.json()).error).toContain("existing password");
  expect((await (await request.get("/api/auth/me")).json()).user).toBeNull();
  expect((await request.post("/api/auth/login", { data: { email, password: "Existing-password-824!" } })).ok()).toBe(true);
  expect((await (await request.get("/api/auth/me")).json()).user.role).toBe("admin");
});
