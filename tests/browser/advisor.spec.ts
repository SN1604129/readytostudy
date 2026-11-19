import { test, expect } from "./fixtures";
import { randomUUID } from "node:crypto";

const preferences = { destination: "australia", level: "masters", field: "it", budget: "medium" };
const path = "/course-finder?destination=australia&level=masters&field=it&budget=medium";

test("course selection, sign-up return, sourced search and mobile layout", async ({ page, request }) => {
  await request.post("/api/auth/signup", { data: { name: "Test Administrator", role: "admin", inviteCode: "test-only-admin-invite", email: `${randomUUID()}@example.com`, password: "Test-only-password-824!" } });
  const saved = await request.put("/api/admin/courses", { data: { courses: [{ title: "Master of Information Technology", university: "Torrens University Australia", destination: "australia", level: "masters", fields: ["it"], budget: "medium", verified: true }] } });
  expect(saved.ok()).toBe(true);
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  page.on("console", message => { if (message.type() === "error" && /hydrat|didn't match/.test(message.text())) errors.push(message.text()); });
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "Your course advisor" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ask about this course" })).toBeVisible();
  await page.getByRole("link", { name: "create an account", exact: true }).click();
  await page.getByLabel("Full name").fill("Test Student");
  await page.getByLabel("Email", { exact: true }).fill(`student-${randomUUID()}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill("Test-only-password-824!");
  await page.getByRole("button", { name: "Create account", exact: true }).click();
  await expect(page).toHaveURL(/course-finder\?/);
  await expect(page.getByText("5 of 5 replies left")).toBeVisible();
  await page.getByRole("button", { name: "Search universities" }).click();
  await expect(page.getByText("University web results", { exact: false })).toBeVisible();
  await expect(page.getByRole("link", { name: /Master of Information Technology — course overview/ })).toHaveAttribute("href", /^https:\/\/www.torrens.edu.au/);
  await expect(page.getByText("4 of 5 replies left")).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: "artifacts/advisor-desktop.png", fullPage: true, animations: "disabled" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator("#course-advisor").scrollIntoViewIfNeeded();
  await page.screenshot({ path: "artifacts/advisor-mobile.png", animations: "disabled" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  await page.reload();
  await expect(page.getByRole("log", { name: "Advisor conversation" }).getByText("Find official university course pages for my selected preferences.", { exact: true })).toBeVisible();
  await page.goto("/student/history");
  await expect(page.getByRole("heading", { name: "University search", exact: true })).toBeVisible();
  await page.getByText("Read conversation", { exact: true }).click();
  await expect(page.getByRole("link", { name: "Master of Information Technology — course overview", exact: true })).toBeVisible();
});

test("API blocks anonymous, cross-origin and malformed calls", async ({ request }) => {
  const data = { requestId: randomUUID(), preferences, mode: "chat", messages: [{ role: "user", content: "Explain my options" }] };
  expect((await request.post("/api/chat", { data, headers: { Origin: "http://127.0.0.1:3105" } })).status()).toBe(401);
  expect((await request.post("/api/chat", { data, headers: { Origin: "https://another.example" } })).status()).toBe(403);
  await request.post("/api/auth/signup", { data: { name: "API Student", email: `${randomUUID()}@example.com`, password: "Test-only-password-824!" } });
  expect((await request.post("/api/chat", { data: { ...data, preferences: { destination: "invalid" } }, headers: { Origin: "http://127.0.0.1:3105" } })).status()).toBe(400);
  const response = await request.post("/api/chat", { data, headers: { Origin: "http://127.0.0.1:3105" } });
  expect(response.status()).toBe(200);
  const duplicate = await request.post("/api/chat", { data, headers: { Origin: "http://127.0.0.1:3105" } });
  expect(duplicate.status()).toBe(200);
  expect((await duplicate.json()).status.remaining).toBe(4);
  const account = await (await request.get("/api/account")).json();
  expect(account.conversation).toHaveLength(2);
  const history = await (await request.get("/api/account/history")).json();
  expect(history.activities.filter((item: { type: string }) => item.type === "chat")).toHaveLength(1);
  const tooSoon = await request.post("/api/chat", { data: { ...data, requestId: randomUUID() }, headers: { Origin: "http://127.0.0.1:3105" } });
  expect(tooSoon.status()).toBe(429);
});

test("provider failure keeps a counted reservation and returns a useful fallback", async ({ request }) => {
  await request.post("/api/auth/signup", { data: { name: "Failure Student", email: `${randomUUID()}@example.com`, password: "Test-only-password-824!" } });
  const response = await request.post("/api/chat", { headers: { Origin: "http://127.0.0.1:3105" }, data: { requestId: randomUUID(), preferences, mode: "chat", messages: [{ role: "user", content: "simulate provider failure" }] } });
  expect(response.status()).toBe(503);
  const data = await response.json(); expect(data.fallback).toBe(true); expect(data.status.remaining).toBe(4);
});
