import { test, expect } from "./fixtures";
import { randomUUID } from "node:crypto";

test("contact inbox and uploads survive logout and a fresh authenticated session", async ({ request }) => {
  expect((await request.get("/api/admin/enquiries")).status()).toBe(401);
  const email = `${randomUUID()}@example.com`;
  const password = "Test-only-password-824!";
  const signup = await request.post("/api/auth/signup", { data: { name: "Storage Administrator", email, password, role: "admin", inviteCode: "test-only-admin-invite" } });
  expect(signup.status()).toBe(201);
  const contactEmail = `${randomUUID()}@example.com`;
  const submitted = await request.post("/api/contact", { data: { fullName: "Storage Test Student", dateOfBirth: "2000-01-01", email: contactEmail, phone: "+8801700000000", destination: "australia", studyLevel: "masters", consent: "yes" } });
  expect(submitted.status()).toBe(200);
  const image = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB1sAAAAASUVORK5CYII=", "base64");
  const uploaded = await request.post("/api/admin/uploads", { multipart: { file: { name: "test.png", mimeType: "image/png", buffer: image } } });
  expect(uploaded.status()).toBe(200);
  const { url } = await uploaded.json();
  const served = await request.get(url);
  expect(served.status()).toBe(200);
  expect(await served.body()).toEqual(image);
  expect(served.headers()["content-type"]).toBe("image/png");
  expect((await request.post("/api/auth/logout")).ok()).toBe(true);
  expect((await request.get("/api/admin/enquiries")).status()).toBe(401);
  expect((await request.post("/api/auth/login", { data: { email, password } })).ok()).toBe(true);
  const inbox = await request.get("/api/admin/enquiries");
  expect((await inbox.json()).enquiries.some((entry: { email: string }) => entry.email === contactEmail)).toBe(true);
  expect((await request.get(url)).status()).toBe(200);
});
