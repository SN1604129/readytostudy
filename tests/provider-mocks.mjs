// Loaded only by the isolated browser-test server. Never imported by application code.
import { appendFileSync, readFileSync } from "node:fs";
import path from "node:path";
if (process.env.ADVISOR_TEST_MODE !== "1" || process.env.NODE_ENV === "production") throw new Error("Provider mocks are test-only.");
const original = globalThis.fetch;
globalThis.fetch = async (input, options) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  if (url === "https://www.googleapis.com/oauth2/v3/certs") {
    const fixture = JSON.parse(readFileSync(path.join(process.env.RTS_DATA_DIR, "google-test-key.json"), "utf8"));
    return Response.json({ keys: [fixture.publicKey] }, { headers: { "Cache-Control": "public, max-age=3600" } });
  }
  if (url === "https://api.resend.com/emails") {
    const body = JSON.parse(String(options.body));
    appendFileSync(path.join(process.env.RTS_DATA_DIR, "email-test-log.jsonl"), JSON.stringify(body) + "\n");
    return Response.json({ id: crypto.randomUUID() });
  }
  if (url === "https://api.tavily.com/search") return Response.json({ results: [{ title: "Master of Information Technology — course overview", url: "https://www.torrens.edu.au/courses/technology/master-of-information-technology", content: "Explore postgraduate information technology. Check this university page for entry requirements and current international tuition." }] });
  if (url === "https://api.groq.com/openai/v1/chat/completions") {
    const body = JSON.parse(String(options.body));
    if (body.messages.at(-1).content.includes("simulate provider failure")) return new Response("unavailable", { status: 503 });
    return Response.json({ choices: [{ message: { content: "Your preferences are saved. Compare the official university source [1] and confirm current fees and entry requirements with a counsellor." } }], usage: { total_tokens: 350 } });
  }
  return original(input, options);
};
