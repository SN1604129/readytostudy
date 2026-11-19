import { cookies } from "next/headers";
import { resetPassword, SESSION_COOKIE } from "@/lib/server-auth";
import { boundedJson } from "@/lib/advisor/security";
import { networkKey, rateLimit, requireSameOrigin, RequestError, requestError } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    let body;
    try { body = await boundedJson(request); } catch { throw new RequestError("Invalid password reset request."); }
    await rateLimit("reset-submit", networkKey(request), 20, 3600000);
    try { await resetPassword(String(body.token ?? ""), String(body.password ?? "")); }
    catch (error) {
      if (error instanceof Error && /reset link|Password must/.test(error.message)) throw new RequestError(error.message);
      throw error;
    }
    (await cookies()).delete(SESSION_COOKIE);
    return Response.json({ ok: true });
  } catch (error) { return requestError(error, "Could not reset your password. Please try again."); }
}
