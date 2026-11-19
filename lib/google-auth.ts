import { createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from "jose";
import { mutateDocument, readDocument } from "./persistent-data.ts";
import { authReturnPath } from "./auth-return.ts";
import { RequestError } from "./request-security.ts";

export const GOOGLE_FLOW_COOKIE = "rts_google_flow";
export const googleFlowCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/api/auth/google", maxAge: 600 };
export const googleClientId = () => process.env.GOOGLE_CLIENT_ID?.trim() || "";
type Flow = { bindingHash: string; nonceHash: string; expires: number; nextPath: string };
export type GoogleIdentity = { subject: string; email: string; name: string; nonce: string };
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const validToken = (value: unknown): value is string => typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"), { timeoutDuration: 10000, cacheMaxAge: 600000 });

export async function prepareGoogleSignIn(next: unknown, now = Date.now()) {
  if (!googleClientId()) throw new RequestError("Google sign-in is not available yet. Please use email and password.", 503);
  const binding = randomBytes(32).toString("hex"), nonce = randomBytes(32).toString("hex");
  await mutateDocument<Flow[], void>("google-signins", [], flows => ({
    value: [...flows.filter(flow => flow.expires > now), { bindingHash: hash(binding), nonceHash: hash(nonce), expires: now + 600000, nextPath: authReturnPath(next) }], result: undefined,
  }));
  return { binding, nonce };
}

export async function assertGoogleFlow(binding: unknown, now = Date.now()) {
  if (!validToken(binding) || !(await readDocument<Flow[]>("google-signins", [])).some(flow => flow.bindingHash === hash(binding) && flow.expires > now)) throw new RequestError("Your Google sign-in expired. Please try again.", 400);
}

export async function verifyGoogleIdentity(credential: unknown, keys: JWTVerifyGetKey = googleKeys): Promise<GoogleIdentity> {
  const clientId = googleClientId();
  if (!clientId) throw new RequestError("Google sign-in is not available yet. Please use email and password.", 503);
  if (typeof credential !== "string" || credential.length > 12000 || credential.split(".").length !== 3) throw new RequestError("Could not verify your Google account. Please try again.", 400);
  try {
    const { payload } = await jwtVerify(credential, keys, {
      algorithms: ["RS256"], issuer: ["accounts.google.com", "https://accounts.google.com"], audience: clientId,
      requiredClaims: ["sub", "email", "email_verified", "nonce", "iat", "exp"], maxTokenAge: "1h", clockTolerance: 5,
    });
    if ((payload.azp !== undefined && payload.azp !== clientId) || (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== clientId)) throw new Error("Invalid authorized party");
    if (!payload.sub || payload.sub.length > 255 || payload.email_verified !== true || typeof payload.email !== "string" || payload.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(payload.email) || !validToken(payload.nonce)) throw new Error("Invalid Google identity");
    const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 120) : "";
    return { subject: payload.sub, email: payload.email.toLowerCase(), name: name || "Student", nonce: payload.nonce };
  } catch { throw new RequestError("Could not verify your Google account. Please try again.", 400); }
}

export async function consumeGoogleFlow(binding: unknown, nonce: unknown, now = Date.now()) {
  if (!validToken(binding) || !validToken(nonce)) throw new RequestError("Your Google sign-in expired. Please try again.", 400);
  return mutateDocument<Flow[], string>("google-signins", [], flows => {
    const flow = flows.find(item => item.bindingHash === hash(binding) && item.nonceHash === hash(nonce) && item.expires > now);
    if (!flow) throw new RequestError("Your Google sign-in expired. Please try again.", 400);
    return { value: flows.filter(item => item !== flow && item.expires > now), result: flow.nextPath };
  });
}
