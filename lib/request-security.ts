import { createHash, createHmac } from "node:crypto";
import { mutateDocument } from "./persistent-data.ts";

export class RequestError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

export function requireSameOrigin(request: Request) {
  const expected = new URL(process.env.APP_ORIGIN || request.url).origin;
  const origin = request.headers.get("origin");
  if ((origin && origin !== expected) || (!origin && process.env.NODE_ENV === "production")) {
    throw new RequestError("Please send your request from this website.", 403);
  }
}

export function networkKey(request: Request) {
  const header = process.env.VERCEL ? "x-vercel-forwarded-for" : process.env.ADVISOR_TRUSTED_IP_HEADER;
  const ip = header ? request.headers.get(header)?.split(",")[0]?.trim() : undefined;
  return ip ? createHmac("sha256", process.env.APP_SECRET || "local-development").update(ip).digest("hex") : "shared";
}

export async function rateLimit(scope: string, key: string, maximum: number, windowMs: number, now = Date.now()) {
  const digest = createHash("sha256").update(key).digest("hex");
  const allowed = await mutateDocument<Record<string, { count: number; expires: number }>, boolean>(`rate-${scope}`, {}, records => {
    const current = Object.fromEntries(Object.entries(records).filter(([, value]) => value.expires > now));
    const bucket = current[digest] ?? { count: 0, expires: now + windowMs };
    bucket.count += 1; current[digest] = bucket;
    return { value: current, result: bucket.count <= maximum };
  });
  if (!allowed) throw new RequestError("Too many attempts. Please try again later.", 429);
}

export function requestError(error: unknown, fallback: string) {
  if (error instanceof RequestError) return Response.json({ error: error.message }, { status: error.status });
  return Response.json({ error: fallback }, { status: 503 });
}
