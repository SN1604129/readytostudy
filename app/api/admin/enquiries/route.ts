import type { NextRequest } from "next/server";
import { getContactEnquiries, getContactEnquiry, setEnquiryStatus } from "@/lib/contact-messages";
import { requireAdmin } from "@/lib/server-auth";
import { deliverContactEnquiry } from "@/lib/contact-delivery";
import { boundedJson } from "@/lib/advisor/security";
import { rateLimit } from "@/lib/request-security";
import { recordActivity } from "@/lib/account-store";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  return Response.json({ enquiries: await getContactEnquiries() });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  try {
    const body = await boundedJson(request);
    const enquiry = typeof body.id === "string" ? await getContactEnquiry(body.id) : undefined;
    if (!enquiry) return Response.json({ error: "Enquiry not found." }, { status: 404 });
    await rateLimit("enquiry-retry", enquiry.id, 5, 3600000);
    await recordActivity(auth.user.id, { type: "admin", title: "Enquiry email delivery retried", detail: `RTS-${enquiry.id.toUpperCase()}`, href: "/admin#enquiries" });
    return Response.json({ enquiry: await deliverContactEnquiry(enquiry) });
  } catch { return Response.json({ error: "Could not retry notifications. Please try again later." }, { status: 503 }); }
}

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  try {
    const body = await boundedJson(request);
    if (typeof body.id !== "string" || !["new", "contacted", "closed"].includes(String(body.status))) return Response.json({ error: "Invalid enquiry status." }, { status: 400 });
    const found = await setEnquiryStatus(body.id, body.status as "new" | "contacted" | "closed");
    if (found) {
      const enquiry = await getContactEnquiry(body.id);
      const detail = `RTS-${body.id.toUpperCase()} · ${body.status}`;
      await recordActivity(auth.user.id, { type: "admin", title: "Enquiry status updated", detail, href: "/admin#enquiries" });
      if (enquiry?.userId) await recordActivity(enquiry.userId, { type: "enquiry", title: "Enquiry status updated", detail, href: "/student/history" });
    }
    return found ? Response.json({ ok: true }) : Response.json({ error: "Enquiry not found." }, { status: 404 });
  } catch { return Response.json({ error: "Could not update enquiry." }, { status: 503 }); }
}
