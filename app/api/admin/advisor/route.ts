import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { advisorConfiguration } from "@/lib/advisor/security";
import { getAdvisorStore } from "@/lib/advisor/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;
  const configuration = advisorConfiguration();
  try { return Response.json({ ...await getAdvisorStore().overview(), configuration, searchConfigured: Boolean(process.env.TAVILY_API_KEY) }, { headers: { "Cache-Control": "private, no-store" } }); }
  catch { return Response.json({ configuration, storageError: "Persistent quota storage is unavailable. AI calls are blocked." }, { headers: { "Cache-Control": "private, no-store" } }); }
}
