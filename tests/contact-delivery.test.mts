import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { recordContactEnquiry, getContactEnquiry, getContactEnquiries } from "../lib/contact-messages.ts";
import { deliverContactEnquiry, contactReceipt } from "../lib/contact-delivery.ts";
import { normalizeEvents, getPublicEvents, saveCmsEvents } from "../lib/cms-events.ts";
import { getCmsDestinations, saveCmsDestinations } from "../lib/cms-destinations.ts";
import { writeDocument } from "../lib/persistent-data.ts";
import { rateLimit, requireSameOrigin } from "../lib/request-security.ts";

async function isolated(run: () => Promise<void>) {
  const keys = ["RTS_DATA_DIR", "DATABASE_URL", "POSTGRES_URL", "VERCEL", "AWS_LAMBDA_FUNCTION_NAME", "RESEND_API_KEY", "EMAIL_FROM", "CONTACT_WEBHOOK_URL", "APP_ORIGIN", "CONTACT_NOTIFICATION_EMAIL", "EMAIL_REPLY_TO"];
  const saved = keys.map(key => process.env[key]);
  const directory = mkdtempSync(path.join(tmpdir(), "rts-contact-"));
  const fetcher = globalThis.fetch;
  keys.forEach(key => delete process.env[key]);
  process.env.RTS_DATA_DIR = directory;
  try { await run(); }
  finally { globalThis.fetch = fetcher; keys.forEach((key, i) => saved[i] === undefined ? delete process.env[key] : process.env[key] = saved[i]); rmSync(directory, { recursive: true, force: true }); }
}
const input = { fullName: "Student <script>", email: "student@example.com", phone: "+8801700000000", dateOfBirth: "2000-01-01", destination: "Canada", studyLevel: "Master's", consent: "yes" };

test("missing mail configuration preserves enquiries without claiming an email was sent", () => isolated(async () => {
  const enquiry = await recordContactEnquiry(input);
  globalThis.fetch = async () => { throw new Error("Unexpected network request"); };
  const result = await deliverContactEnquiry(enquiry);
  assert.equal(result.notifications?.teamEmail?.status, "unconfigured");
  assert.equal(result.notifications?.confirmationEmail?.status, "unconfigured");
  assert.equal(contactReceipt(result).confirmationSent, false);
  assert.equal((await getContactEnquiries()).length, 1);
}));

test("independent email failure is retained and retry skips already accepted notifications", () => isolated(async () => {
  process.env.RESEND_API_KEY = "test-only";
  process.env.EMAIL_FROM = "Ready to Study <info@readytostudy.com.au>";
  const enquiry = await recordContactEnquiry(input);
  const calls: Array<{ body: Record<string, unknown>; key: string }> = [];
  let failing = true;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    calls.push({ body, key: new Headers(options?.headers).get("Idempotency-Key")! });
    if (body.to[0] === input.email && failing) return new Response("unavailable", { status: 503 });
    return Response.json({ id: `email-${calls.length}` });
  };
  const first = await deliverContactEnquiry(enquiry);
  assert.equal(first.notifications?.teamEmail?.status, "sent");
  assert.equal(first.notifications?.confirmationEmail?.status, "failed");
  assert.equal(calls[0].body.reply_to, input.email);
  assert.deepEqual(calls[0].body.to, ["contact@readytostudy.com.au"]);
  assert.match(String(calls[0].body.html), /Student &lt;script&gt;/);
  failing = false;
  await deliverContactEnquiry((await getContactEnquiry(enquiry.id))!);
  assert.equal(calls.length, 3);
  assert.equal(calls[1].key, calls[2].key);
  const latest = (await getContactEnquiry(enquiry.id))!;
  assert.equal(latest.notifications?.confirmationEmail?.status, "sent");
  assert.equal(contactReceipt(latest).confirmationSent, true);
}));

test("concurrent notification attempts and duplicate submissions do not send twice", () => isolated(async () => {
  process.env.RESEND_API_KEY = "test-only"; process.env.EMAIL_FROM = "info@readytostudy.com.au";
  const a = await recordContactEnquiry({ ...input, submissionId: "same-submission-reference" });
  const b = await recordContactEnquiry({ ...input, submissionId: "same-submission-reference" });
  assert.equal(a.id, b.id);
  let count = 0;
  globalThis.fetch = async () => { count++; return Response.json({ id: `email-${count}` }); };
  await Promise.all([deliverContactEnquiry(a), deliverContactEnquiry(b)]);
  assert.equal(count, 2);
  assert.equal((await getContactEnquiries()).length, 1);
}));

test("events require review, valid images and unique slugs before publication", () => isolated(async () => {
  const event = { slug: "student-session", name: "Student session", summary: "Guidance", kind: "seminar", images: [], status: "upcoming", verified: false, active: true };
  await saveCmsEvents([event]); assert.equal((await getPublicEvents()).length, 0);
  await saveCmsEvents([{ ...event, verified: true }]); assert.equal((await getPublicEvents()).length, 1);
  await saveCmsEvents([{ ...event, status: "draft", verified: true }]); assert.equal((await getPublicEvents()).length, 0);
  assert.throws(() => normalizeEvents([event, event]), /unique/);
  assert.throws(() => normalizeEvents([{ ...event, images: [{ src: "javascript:alert(1)", alt: "unsafe" }] }]), /valid HTTPS/);
}));

test("legacy country catalogues gain Canada and Italy, while saved deletions stay deleted", () => isolated(async () => {
  await writeDocument("destinations", [{ name: "Australia", slug: "australia" }]);
  const countries = await getCmsDestinations();
  assert.deepEqual(countries.map(item => item.slug), ["australia", "canada", "italy"]);
  await saveCmsDestinations(countries.filter(item => item.slug !== "canada"));
  assert.equal((await getCmsDestinations()).some(item => item.slug === "canada"), false);
  await assert.rejects(saveCmsDestinations([]), /between one/);
  await assert.rejects(saveCmsDestinations([countries[0], countries[0]]), /unique/);
}));

test("request guards reject foreign origins and rate limits survive new requests", () => isolated(async () => {
  process.env.APP_ORIGIN = "https://readytostudy.com.au";
  assert.throws(() => requireSameOrigin(new Request("https://readytostudy.com.au/api/contact", { headers: { Origin: "https://another.example" } })), /this website/);
  await rateLimit("test", "email", 1, 10000, 1000);
  await assert.rejects(rateLimit("test", "email", 1, 10000, 1001), /Too many/);
  await rateLimit("test", "email", 1, 10000, 12000);
}));
