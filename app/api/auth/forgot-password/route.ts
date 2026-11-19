import { createPasswordReset } from "@/lib/server-auth";
import { boundedJson } from "@/lib/advisor/security";
import { emailConfiguration, sendEmail } from "@/lib/email";
import { networkKey, rateLimit, requireSameOrigin, RequestError, requestError } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    requireSameOrigin(request);
    let body;
    try { body = await boundedJson(request); } catch { throw new RequestError("Please enter your email address."); }
    const email = String(body.email ?? "").trim().toLowerCase();
    if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new RequestError("Please enter a valid email address.");
    await rateLimit("reset-network", networkKey(request), 20, 3600000);
    await rateLimit("reset-email", email, 3, 3600000);
    if (!emailConfiguration().configured) return Response.json({ error: "Password recovery is temporarily unavailable. Please contact our team." }, { status: 503 });
    const origin = process.env.APP_ORIGIN;
    if (!origin || !/^https?:\/\//.test(origin)) return Response.json({ error: "Password recovery is temporarily unavailable. Please contact our team." }, { status: 503 });
    const reset = await createPasswordReset(email);
    if (reset) {
      const link = `${new URL(origin).origin}/reset-password#${reset.token}`;
      try { await sendEmail({ to: reset.user.email, subject: "Reset your Ready to Study password", text: `Hi ${reset.user.name},\n\nUse this link to reset your password. It expires in 30 minutes and can be used once.\n\n${link}\n\nIf you did not request this, you can ignore this email.\n\nReady to Study` }, `password-reset/${reset.token}`); }
      catch { console.error("[password-reset] Email provider unavailable."); }
    }
    return Response.json({ ok: true, message: "If an account exists for this address, you will receive a password reset link. Check your inbox and spam folder." });
  } catch (error) { return requestError(error, "Password recovery is temporarily unavailable. Please contact our team."); }
}
