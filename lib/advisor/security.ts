import { databaseConfigured } from "../persistent-data.ts";
import { createHmac } from "node:crypto";
import type { NextRequest } from "next/server";

export function advisorConfiguration() {
  const issues: string[] = [];
  if (process.env.ADVISOR_ENABLED !== "true") issues.push("Set ADVISOR_ENABLED=true after setup.");
  if (!process.env.GROQ_API_KEY) issues.push("Add GROQ_API_KEY.");
  if (process.env.NODE_ENV === "production") {
    if (!databaseConfigured() && !process.env.RTS_DATA_DIR) issues.push("Set RTS_DATA_DIR to a persistent directory.");
    if (!process.env.APP_ORIGIN?.startsWith("https://")) issues.push("Set APP_ORIGIN to the HTTPS site URL.");
    if (!process.env.APP_SECRET || process.env.APP_SECRET.length < 32) issues.push("Set a random APP_SECRET of at least 32 characters.");
    if (!process.env.TURNSTILE_SECRET_KEY || !process.env.TURNSTILE_SITE_KEY) issues.push("Configure both Turnstile keys.");
    if (!process.env.VERCEL && !process.env.ADVISOR_TRUSTED_IP_HEADER) issues.push("Configure the reverse proxy IP header.");
  }
  if ((process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) && !databaseConfigured()) issues.push("Connect a PostgreSQL database for accounts and quotas.");
  return { available: !issues.length, searchAvailable: !issues.length && Boolean(process.env.TAVILY_API_KEY), issues };
}

export function assertOrigin(request: NextRequest) {
  const expected = process.env.APP_ORIGIN ? new URL(process.env.APP_ORIGIN).origin : request.nextUrl.origin;
  if (request.headers.get("origin") !== expected) throw new Error("Please send your request from this website.");
}

export function requestIp(request: NextRequest) {
  const header = process.env.VERCEL ? "x-vercel-forwarded-for" : process.env.ADVISOR_TRUSTED_IP_HEADER;
  if (!header) return "";
  const ip = request.headers.get(header)?.trim();
  if (!ip || !/^[a-fA-F0-9:.]{3,64}$/.test(ip)) throw new Error("The server could not verify this connection.");
  return createHmac("sha256", process.env.APP_SECRET || "local-development").update(ip).digest("hex");
}

export async function verifyTurnstile(token: unknown) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret && process.env.NODE_ENV !== "production") return;
  if (!secret || typeof token !== "string" || !token || token.length > 2048) throw new Error("Please complete the security check.");
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret, response: token }),
    cache: "no-store", signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Security check unavailable. Please try again.");
  const data = await response.json();
  const hostname = process.env.APP_ORIGIN ? new URL(process.env.APP_ORIGIN).hostname : null;
  if (!data.success || data.action !== "advisor" || (hostname && data.hostname !== hostname)) throw new Error("Security check expired. Please try again.");
}

export async function boundedJson(request: Request, maximum = 16000): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new Error("Expected a JSON request.");
  if (Number(request.headers.get("content-length")) > maximum) throw new Error("Your message is too long.");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Empty request.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maximum) { await reader.cancel(); throw new Error("Your message is too long."); }
      chunks.push(value);
    }
    const body: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid request.");
    return body as Record<string, unknown>;
  } finally { reader.releaseLock(); }
}
