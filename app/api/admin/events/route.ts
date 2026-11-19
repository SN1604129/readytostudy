import type { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/server-auth";
import { getCmsEvents, saveCmsEvents } from "@/lib/cms-events";
import { boundedJson } from "@/lib/advisor/security";
import { recordActivity } from "@/lib/account-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  return Response.json({ events: await getCmsEvents() });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  try {
    const body = await boundedJson(request, 200000);
    const events = await saveCmsEvents(body.events);
    await recordActivity(auth.user.id, { type: "admin", title: "Events saved", detail: `${events.length} events`, href: "/admin" });
    revalidatePath("/events");
    return Response.json({ events });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Could not save events." }, { status: 400 });
  }
}
