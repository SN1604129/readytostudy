import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server-auth";
import { getAccountHistory, recordActivity } from "@/lib/account-store";
import { getUserEnquiries } from "@/lib/contact-messages";
import { boundedJson } from "@/lib/advisor/security";
import { rateLimit, requireSameOrigin, RequestError, requestError } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) throw new RequestError("Please log in to see your history.", 401);
    const before = request.nextUrl.searchParams.get("before") || undefined;
    return Response.json({ ...await getAccountHistory(user.id, before), enquiries: before ? [] : await getUserEnquiries(user.id) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return requestError(error, "Could not load your history. Please try again."); }
}

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const user = await getUserFromRequest(request);
    if (!user) throw new RequestError("Please log in first.", 401);
    const body = await boundedJson(request);
    if (typeof body.id !== "string" || !/^[a-f0-9-]{36}$/.test(body.id) || typeof body.path !== "string" || !/^\/(?:$|about$|services$|events$|contact$|course-finder$|destinations(?:\/[a-z0-9-]+)?$|budget$|checklist$|compare$|readiness$|student(?:\/history)?$|pte-ielts-support(?:\/[a-z-]+){0,2}$)/.test(body.path)) throw new RequestError("Invalid page.");
    await rateLimit("history-visit", user.id, 120, 60000);
    await recordActivity(user.id, { id: body.id, type: "visit", title: "Page visited", detail: body.path === "/" ? "Home" : body.path.split("/").filter(Boolean).join(" / ").replaceAll("-", " "), href: body.path });
    return Response.json({ ok: true });
  } catch (error) { return requestError(error, "Could not save this visit."); }
}
