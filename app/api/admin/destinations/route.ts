import type { NextRequest } from "next/server";
import { getCmsDestinations, saveCmsDestinations } from "@/lib/cms-destinations";
import { requireAdmin } from "@/lib/server-auth";
import { revalidatePath } from "next/cache";
import { boundedJson } from "@/lib/advisor/security";
import { recordActivity } from "@/lib/account-store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  return Response.json({ destinations: await getCmsDestinations() });
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  try {
    const body = await boundedJson(request, 200000);
    const destinations = await saveCmsDestinations(body.destinations);
    await recordActivity(auth.user.id, { type: "admin", title: "Country catalogue saved", detail: destinations.map(item => item.name).join(", "), href: "/admin" });
    revalidatePath("/", "layout");
    return Response.json({ destinations });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not save destinations." },
      { status: 400 },
    );
  }
}
