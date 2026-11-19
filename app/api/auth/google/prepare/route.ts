import { cookies } from "next/headers";
import { boundedJson } from "@/lib/advisor/security";
import { GOOGLE_FLOW_COOKIE, googleFlowCookieOptions, prepareGoogleSignIn } from "@/lib/google-auth";
import { networkKey, rateLimit, requireSameOrigin, RequestError, requestError } from "@/lib/request-security";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    let body;
    try { body = await boundedJson(request); } catch { throw new RequestError("Please try Google sign-in again."); }
    await rateLimit("google-prepare", networkKey(request), 60, 900000);
    const flow = await prepareGoogleSignIn(body.next);
    (await cookies()).set(GOOGLE_FLOW_COOKIE, flow.binding, googleFlowCookieOptions);
    return Response.json({ nonce: flow.nonce }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return requestError(error, "Could not start Google sign-in. Please try again."); }
}
