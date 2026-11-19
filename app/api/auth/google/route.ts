import { cookies } from "next/headers";
import { boundedJson } from "@/lib/advisor/security";
import { assertGoogleFlow, consumeGoogleFlow, GOOGLE_FLOW_COOKIE, googleFlowCookieOptions, verifyGoogleIdentity } from "@/lib/google-auth";
import { findOrCreateGoogleUser } from "@/lib/google-users";
import { createSession, safeUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server-auth";
import { networkKey, rateLimit, requireSameOrigin, RequestError, requestError } from "@/lib/request-security";
import { recordActivity } from "@/lib/account-store";

export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    let body;
    try { body = await boundedJson(request); } catch { throw new RequestError("Please try Google sign-in again."); }
    await rateLimit("google-signin", networkKey(request), 60, 900000);
    const cookieStore = await cookies();
    const binding = cookieStore.get(GOOGLE_FLOW_COOKIE)?.value;
    await assertGoogleFlow(binding);
    const identity = await verifyGoogleIdentity(body.credential);
    const nextPath = await consumeGoogleFlow(binding, identity.nonce);
    cookieStore.set(GOOGLE_FLOW_COOKIE, "", { ...googleFlowCookieOptions, maxAge: 0 });
    const { user, created } = await findOrCreateGoogleUser(identity);
    const token = await createSession(user.id, user.passwordVersion ?? 0);
    await recordActivity(user.id, { type: "account", title: created ? "Account created with Google" : "Logged in with Google" });
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
    return Response.json({ user: safeUser(user), redirect: user.role === "admin" ? "/admin" : nextPath }, { status: created ? 201 : 200, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return requestError(error, "Google sign-in is temporarily unavailable. Please use email and password or try again later."); }
}
