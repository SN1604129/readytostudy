import { test, expect } from "./fixtures";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

const password = "Test-only-password-824!";
const admin = () => ({ name: "Launch Administrator", email: `${randomUUID()}@example.com`, password, role: "admin", inviteCode: "test-only-admin-invite" });
function emails(): Array<{ to: string[]; text: string; from: string; reply_to: string; subject: string }> {
  return readFileSync(path.join(process.env.RTS_E2E_DATA_DIR!, "email-test-log.jsonl"), "utf8").trim().split("\n").map(line => JSON.parse(line));
}

test("student accounts cannot edit content, and foreign-origin mutations are rejected", async ({ request }) => {
  expect((await request.post("/api/auth/signup", { data: { ...admin(), inviteCode: "wrong" } })).status()).toBe(400);
  expect((await request.post("/api/auth/signup", { data: { name: "Student", email: `${randomUUID()}@example.com`, password } })).status()).toBe(201);
  expect((await request.get("/api/admin/events")).status()).toBe(403);
  expect((await request.get("/api/admin/readiness")).status()).toBe(403);
  expect((await request.post("/api/auth/login", { data: {}, headers: { Origin: "https://another.example" } })).status()).toBe(403);
  expect((await request.post("/api/contact", { data: {}, headers: { Origin: "https://another.example" } })).status()).toBe(403);
});

test("admin can publish an event from the editor and add a country visible on the homepage", async ({ page }) => {
  expect((await page.request.post("/api/auth/signup", { data: admin() })).status()).toBe(201);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Control the public content" })).toBeVisible();
  await page.screenshot({ path: "artifacts/admin-launch-desktop.png", animations: "disabled" });
  await page.getByRole("button", { name: "Add event", exact: true }).click();
  const name = `Canada planning session ${randomUUID().slice(0, 8)}`;
  await page.getByLabel("Event name", { exact: true }).fill(name);
  await page.getByLabel("Event slug", { exact: true }).fill(`session-${randomUUID()}`);
  await page.getByRole("textbox", { name: "Summary", exact: true }).fill("Meet our counsellors and discuss 2027 applications.");
  await page.getByLabel("Publication status").selectOption("upcoming");
  await page.getByLabel("Reviewed and ready to publish", { exact: true }).check();
  await page.getByRole("button", { name: "Save events", exact: true }).click();
  await expect(page.getByText("Saved. Active, reviewed events now appear on the Events page.")).toBeVisible();
  const list = (await (await page.request.get("/api/admin/destinations")).json()).destinations;
  const country = { ...list[0], name: "Launch Test Country", slug: `launch-test-${randomUUID()}`, short: "LT", image: "" };
  expect((await page.request.put("/api/admin/destinations", { data: { destinations: [...list, country] } })).ok()).toBe(true);
  const home = await page.request.get("/"); expect(await home.text()).toContain("Launch Test Country");
  await page.goto("/events");
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "artifacts/events-cms-mobile.png", animations: "disabled" });
  expect((await page.request.put("/api/admin/destinations", { data: { destinations: list } })).ok()).toBe(true);
  await page.goto("/destinations/canada");
  await expect(page.getByRole("heading", { name: "Canada", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/canada-mobile.png", fullPage: true, animations: "disabled" });
  await page.goto("/destinations/italy");
  await expect(page.getByRole("heading", { name: "Italy", exact: true })).toBeVisible();
  await page.screenshot({ path: "artifacts/italy-mobile.png", fullPage: true, animations: "disabled" });
});

test("contact form saves a reference, sends both emails and appears in the protected inbox", async ({ page }) => {
  const email = `enquiry-${randomUUID()}@example.com`;
  await page.goto("/contact");
  await expect(page.getByRole("heading", { name: "Log in to send an enquiry" })).toBeVisible();
  expect((await page.request.post("/api/contact", { data: {} })).status()).toBe(401);
  await page.getByRole("link", { name: "Create an account", exact: true }).click();
  await page.getByLabel("Full name").fill("Launch Flow Student");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await page.getByLabel("Full Name", { exact: false }).fill("Launch Flow Student");
  await page.getByLabel("Date of Birth", { exact: false }).fill("2000-01-01");
  await page.locator("#email").fill(email);
  await page.getByLabel("Phone", { exact: false }).fill("+8801700000000");
  await page.getByLabel("Study Destination", { exact: false }).selectOption("Canada");
  await page.getByLabel("Preferred Study Level", { exact: false }).selectOption("PhD");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Send enquiry", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Received!" })).toBeVisible();
  await expect(page.getByText(/Reference: RTS-/)).toBeVisible();
  await expect(page.getByText(/A confirmation email has been sent/)).toBeVisible();
  await page.getByRole("link", { name: "View your enquiry history" }).click();
  await expect(page.getByRole("heading", { name: "Your enquiries" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Enquiry submitted", exact: true })).toBeVisible();
  const sent = emails();
  expect(sent.some(mail => mail.to.includes("contact@readytostudy.com.au") && mail.reply_to === email)).toBe(true);
  expect(sent.some(mail => mail.to.includes(email) && mail.from.includes("info@readytostudy.com.au"))).toBe(true);
  await page.request.post("/api/auth/signup", { data: admin() });
  const items = (await (await page.request.get("/api/admin/enquiries")).json()).enquiries;
  const enquiry = items.find((item: { email: string }) => item.email === email);
  expect(enquiry.notifications.confirmationEmail.status).toBe("sent");
  const before = emails().length;
  expect((await page.request.post("/api/admin/enquiries", { data: { id: enquiry.id } })).ok()).toBe(true);
  expect(emails().length).toBe(before);
  expect((await page.request.patch("/api/admin/enquiries", { data: { id: enquiry.id, status: "contacted" } })).ok()).toBe(true);
});

test("password reset is single-use and invalidates the old password and sessions", async ({ request }) => {
  const email = `reset-${randomUUID()}@example.com`;
  await request.post("/api/auth/signup", { data: { name: "Reset Student", email, password } });
  const oldCookies = (await request.storageState()).cookies;
  const response = await request.post("/api/auth/forgot-password", { data: { email } });
  expect(response.status()).toBe(200);
  const mail = emails().find(mail => mail.to.includes(email) && mail.subject.includes("Reset your"))!;
  const token = mail.text.match(/reset-password#([a-f0-9]{64})/)![1];
  const nextPassword = "Updated-test-only-password-258!";
  expect((await request.post("/api/auth/reset-password", { data: { token, password: nextPassword } })).ok()).toBe(true);
  const replay = await request.post("/api/auth/reset-password", { data: { token, password: nextPassword } });
  expect(replay.status()).toBe(400);
  const me = await request.get("/api/auth/me", { headers: { Cookie: oldCookies.map(cookie => `${cookie.name}=${cookie.value}`).join("; ") } });
  expect((await me.json()).user).toBeNull();
  expect((await request.post("/api/auth/login", { data: { email, password } })).status()).toBe(401);
  expect((await request.post("/api/auth/login", { data: { email, password: nextPassword } })).ok()).toBe(true);
});
