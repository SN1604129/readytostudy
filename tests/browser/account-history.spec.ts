import { test, expect } from "./fixtures";
import { randomUUID } from "node:crypto";

const password = "Test-only-password-824!";
test("account history and saved study actions persist across devices and never cross accounts", async ({ page, browser }) => {
  expect((await page.request.get("/api/account/history")).status()).toBe(401);
  expect((await page.request.patch("/api/account/journey", { data: {} })).status()).toBe(401);
  const email = `history-${randomUUID()}@example.com`;
  await page.request.post("/api/auth/signup", { data: { name: "History Student", email, password } });
  const action = { id: randomUUID(), command: { type: "checklist", id: "passport" } };
  expect((await page.request.patch("/api/account/journey", { data: action })).ok()).toBe(true);
  expect((await page.request.patch("/api/account/journey", { data: action })).ok()).toBe(true);
  await page.request.patch("/api/account/journey", { data: { id: randomUUID(), command: { type: "save-course", course: { title: "History test computing course", university: "Test University", destination: "canada" } } } });
  const other = await browser.newContext();
  try {
    await other.request.post("http://127.0.0.1:3105/api/auth/signup", { data: { name: "Other Student", email: `other-${randomUUID()}@example.com`, password } });
    const own = await (await other.request.get("http://127.0.0.1:3105/api/account")).json();
    expect(own.journey.savedCourses).toEqual([]);
    const theirHistory = await (await other.request.get("http://127.0.0.1:3105/api/account/history")).json();
    expect(theirHistory.activities.some((item: { type: string }) => item.type === "chat")).toBe(false);
    await other.request.post("http://127.0.0.1:3105/api/auth/logout");
    await other.request.post("http://127.0.0.1:3105/api/auth/login", { data: { email, password } });
    const restored = await (await other.request.get("http://127.0.0.1:3105/api/account")).json();
    expect(restored.journey.checklistDone).toEqual(["passport"]);
    expect(restored.journey.savedCourses).toHaveLength(1);
    expect(restored.conversation).toHaveLength(0);
  } finally { await other.close(); }
  await page.goto("/student/history");
  await expect(page.getByRole("heading", { name: "Course saved", exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("failed cloud saves show a retry and retry records the action once", async ({ page }) => {
  await page.request.post("/api/auth/signup", { data: { name: "Retry Student", email: `retry-${randomUUID()}@example.com`, password } });
  await page.goto("/budget");
  await expect(page.getByRole("link", { name: "My account", exact: true }).first()).toBeAttached();
  let failed = false;
  await page.route("**/api/account/journey", async route => { if (!failed) { failed = true; await route.abort(); } else await route.continue(); });
  await page.getByRole("button", { name: "Save to study plan", exact: true }).click();
  await page.getByRole("button", { name: "Retry saving" }).click();
  await expect(page.getByRole("button", { name: "Retry saving" })).toHaveCount(0);
  const account = await (await page.request.get("/api/account")).json();
  expect(account.journey.budgetEstimate.annualTotal).toBeGreaterThan(0);
  const history = await (await page.request.get("/api/account/history")).json();
  expect(history.activities.filter((item: { type: string }) => item.type === "study")).toHaveLength(1);
});
