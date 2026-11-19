import { cookies } from "next/headers";
import { authenticateUser, createSession, safeUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server-auth";
import { boundedJson } from "@/lib/advisor/security";
import { requireSameOrigin, networkKey, rateLimit, RequestError, requestError } from "@/lib/request-security";
import { recordActivity } from "@/lib/account-store";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    let body;
    try { body = await boundedJson(request); } catch { throw new RequestError("Please check your login details."); }
    await rateLimit("login-network", networkKey(request), 120, 900000);
    await rateLimit("login-email", String(body.email ?? "").trim().toLowerCase(), 10, 900000);
    let user;
    try { user = await authenticateUser(String(body.email ?? ""), String(body.password ?? "")); }
    catch { throw new RequestError("Email or password is incorrect.", 401); }
    const token = await createSession(user.id, user.passwordVersion ?? 0);
    await recordActivity(user.id, { type: "account", title: "Logged in" });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
    return Response.json({ user: safeUser(user) });
  } catch (error) {
    return requestError(error, "Login is temporarily unavailable. Please try again.");
  }
}
