import { recordContactEnquiry } from "@/lib/contact-messages";
import { contactReceipt, deliverContactEnquiry } from "@/lib/contact-delivery";
import { boundedJson } from "@/lib/advisor/security";
import { networkKey, rateLimit, requireSameOrigin, RequestError, requestError } from "@/lib/request-security";
import { getCmsDestinations } from "@/lib/cms-destinations";
import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server-auth";
import { recordEnquiryActivity } from "@/lib/account-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let saved: Awaited<ReturnType<typeof recordContactEnquiry>> | undefined;
  try {
    requireSameOrigin(request);
    const user = await getUserFromRequest(request);
    if (!user) throw new RequestError("Please log in or create an account before submitting an enquiry.", 401);
    let data: Record<string, unknown>;
    try { data = await boundedJson(request); } catch { throw new RequestError("Please check your form and try again."); }
    if (data.website) return Response.json({ ok: true });
    for (const [key, max] of Object.entries({ fullName: 120, dateOfBirth: 10, email: 254, phone: 40, destination: 120, studyLevel: 100, preferredCity: 150, englishTest: 100, englishScore: 30, message: 3000, consent: 3, submissionId: 36 })) {
      if (data[key] !== undefined && (typeof data[key] !== "string" || (data[key] as string).length > max)) throw new RequestError(`Please check ${key}.`);
      if (typeof data[key] === "string") data[key] = (data[key] as string).trim();
    }
    const required = ["fullName", "dateOfBirth", "email", "phone", "destination", "studyLevel"];
    if (required.some(key => !data[key]) || data.consent !== "yes") throw new RequestError("Complete the required fields and consent to contact.");
    const email = String(data.email).toLowerCase();
    if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new RequestError("Please enter a valid email address.");
    if (!/^[+()\d\s.-]{7,40}$/.test(String(data.phone))) throw new RequestError("Please enter a valid phone number.");
    const dob = String(data.dateOfBirth);
    const parsed = new Date(`${dob}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== dob || parsed.getTime() > Date.now() || parsed.getUTCFullYear() < 1900) throw new RequestError("Please enter a valid date of birth.");
    if (data.submissionId && !/^[a-zA-Z0-9-]{16,36}$/.test(String(data.submissionId))) throw new RequestError("Invalid submission reference. Please reload the form.");
    const destinations = await getCmsDestinations();
    if (!destinations.some(item => [item.slug, item.name.toLowerCase()].includes(String(data.destination).toLowerCase()))) throw new RequestError("Please select a study destination from the list.");
    await rateLimit("contact-network", networkKey(request), 20, 3600000);
    await rateLimit("contact-email", email, 5, 3600000);
    saved = await recordContactEnquiry({ ...data, email }, user.id);
    await recordEnquiryActivity(user.id, saved.id, contactReceipt(saved).reference, saved.destination);
    const delivered = await deliverContactEnquiry(saved);
    return Response.json({ ok: true, delivery: contactReceipt(delivered) });
  } catch (error) {
    if (saved) return Response.json({ ok: true, delivery: contactReceipt(saved) }, { status: 202 });
    return requestError(error, "We could not save your enquiry. Please try again or contact us by phone or email.");
  }
}
