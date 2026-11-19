import { cookies } from "next/headers";
import { createSession, createUser, safeUser, SESSION_COOKIE, sessionCookieOptions } from "@/lib/server-auth";
import { boundedJson } from "@/lib/advisor/security";
import { requireSameOrigin, networkKey, rateLimit, RequestError, requestError } from "@/lib/request-security";
import { recordActivity } from "@/lib/account-store";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    let body;
    try { body = await boundedJson(request); } catch { throw new RequestError("Please check your account details."); }
    await rateLimit("signup-network", networkKey(request), 30, 3600000);
    let user;
    try { user = await createUser({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      password: String(body.password ?? ""),
      role: body.role === "admin" ? "admin" : "student",
      inviteCode: typeof body.inviteCode === "string" ? body.inviteCode : undefined,
    }); } catch (error) {
      if (error instanceof Error && /name|email|Password|invite code/.test(error.message)) throw new RequestError(error.message);
      throw error;
    }
    const token = await createSession(user.id, user.passwordVersion ?? 0);
    await recordActivity(user.id, { type: "account", title: "Account created" });
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions);
    return Response.json({ user: safeUser(user) }, { status: 201 });
  } catch (error) {
    return requestError(error, "Account creation is temporarily unavailable. Please try again.");
  }
}
