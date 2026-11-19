export type EmailMessage = { to: string; subject: string; text: string; html?: string; replyTo?: string };

export function emailConfiguration() {
  return {
    configured: Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
    from: process.env.EMAIL_FROM || "Ready to Study <info@readytostudy.com.au>",
    inbox: process.env.CONTACT_NOTIFICATION_EMAIL || "contact@readytostudy.com.au",
    replyTo: process.env.EMAIL_REPLY_TO || "contact@readytostudy.com.au",
  };
}

export function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!);
}

/** A successful response means accepted by the provider, not confirmed inbox delivery. */
export async function sendEmail(message: EmailMessage, idempotencyKey: string) {
  const config = emailConfiguration();
  if (!config.configured) throw new Error("Email is not configured.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
    body: JSON.stringify({ from: config.from, to: [message.to], reply_to: message.replyTo || config.replyTo, subject: message.subject, text: message.text, html: message.html || `<div style="font-family:Arial,sans-serif;max-width:640px;color:#10233f"><h2>Ready to Study</h2><p style="white-space:pre-line">${escapeHtml(message.text)}</p></div>` }),
  });
  if (!response.ok) throw new Error(`Email provider returned HTTP ${response.status}.`);
  const result = await response.json();
  if (typeof result.id !== "string") throw new Error("Email provider did not confirm acceptance.");
  return result.id;
}
