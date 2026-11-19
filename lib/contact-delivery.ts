import { createHash } from "node:crypto";
import { emailConfiguration, sendEmail } from "./email.ts";
import { claimNotification, finishNotification, getContactEnquiry, type ContactEnquiry, type DeliveryChannel } from "./contact-messages.ts";

function reference(enquiry: ContactEnquiry) { return `RTS-${enquiry.id.toUpperCase()}`; }

export async function deliverContactEnquiry(enquiry: ContactEnquiry) {
  const config = emailConfiguration();
  const ref = reference(enquiry);
  const details = [
    `Reference: ${ref}`, `Name: ${enquiry.fullName}`, `Email: ${enquiry.email}`, `Phone: ${enquiry.phone}`,
    `Date of birth: ${enquiry.dateOfBirth}`, `Destination: ${enquiry.destination}`, `Study level: ${enquiry.studyLevel}`,
    `Preferred city: ${enquiry.preferredCity || "Not provided"}`, `English: ${[enquiry.englishTest, enquiry.englishScore].filter(Boolean).join(" ") || "Not provided"}`,
    `Message: ${enquiry.message || "Not provided"}`, `Consent to contact: ${enquiry.consent}`, `Received: ${enquiry.receivedAt}`,
  ].join("\n");
  const origin = process.env.APP_ORIGIN || "https://www.readytostudy.org";

  // Persist each result independently. A failed channel never prevents another from being attempted.
  for (const channel of ["teamEmail", "confirmationEmail", "webhook"] as DeliveryChannel[]) {
    if (!(await claimNotification(enquiry.id, channel))) continue;
    try {
      if (channel === "webhook") {
        const url = process.env.CONTACT_WEBHOOK_URL;
        if (!url) { await finishNotification(enquiry.id, channel, { status: "unconfigured" }); continue; }
        const response = await fetch(url, { method: "POST", signal: AbortSignal.timeout(10000), headers: { "Content-Type": "application/json", "Idempotency-Key": `contact/${enquiry.id}/webhook` }, body: JSON.stringify({ ...enquiry, source: new URL(origin).hostname }) });
        if (!response.ok) throw new Error(`Webhook returned HTTP ${response.status}.`);
        await finishNotification(enquiry.id, channel, { status: "sent" });
        continue;
      }
      if (!config.configured) { await finishNotification(enquiry.id, channel, { status: "unconfigured" }); continue; }
      const message = channel === "teamEmail" ? {
        to: config.inbox, replyTo: enquiry.email,
        subject: `New study enquiry · ${ref}`,
        text: `A new enquiry is ready for follow-up.\n\n${details}\n\nManage this enquiry: ${origin}/admin#enquiries`,
      } : {
        to: enquiry.email, replyTo: config.replyTo,
        subject: `We received your study enquiry · ${ref}`,
        text: `Hi ${enquiry.fullName},\n\nThank you for contacting Ready to Study. We have received your enquiry about ${enquiry.studyLevel} study in ${enquiry.destination}. A counsellor will review your information and contact you using the details you provided.\n\nYour reference: ${ref}\n\nYou can reply to this email to reach our team. For an urgent enquiry, call +61 426 243 477 or +880 1920 515157.\n\nReady to Study Education Services\n${origin}`,
      };
      const digest = createHash("sha256").update(JSON.stringify({ from: config.from, ...message })).digest("hex").slice(0, 16);
      const providerId = await sendEmail(message, `contact/${enquiry.id}/${channel}/${digest}`);
      await finishNotification(enquiry.id, channel, { status: "sent", providerId });
    } catch (error) {
      await finishNotification(enquiry.id, channel, { status: "failed", error: error instanceof Error ? error.message : "Delivery failed." });
    }
  }
  return (await getContactEnquiry(enquiry.id))!;
}

export function contactReceipt(enquiry: ContactEnquiry) {
  const confirmationSent = enquiry.notifications?.confirmationEmail?.status === "sent";
  return {
    reference: reference(enquiry), confirmationSent,
    message: confirmationSent ? "Your enquiry is saved. A confirmation email has been sent; please check your inbox and spam folder." : "Your enquiry is saved for our team. Your confirmation email is pending; keep this reference for follow-up.",
  };
}
