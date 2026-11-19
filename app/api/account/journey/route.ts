import type { NextRequest } from "next/server";
import { getUserFromRequest } from "@/lib/server-auth";
import { parseJourneyCommand, saveJourneyCommand } from "@/lib/account-store";
import { boundedJson } from "@/lib/advisor/security";
import { rateLimit, requireSameOrigin, RequestError, requestError } from "@/lib/request-security";

export async function PATCH(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const user = await getUserFromRequest(request);
    if (!user) throw new RequestError("Please log in to save your study plan.", 401);
    const body = await boundedJson(request);
    if (typeof body.id !== "string" || !/^[a-f0-9-]{36}$/.test(body.id)) throw new RequestError("Invalid action reference.");
    let command;
    try { command = parseJourneyCommand(body.command); } catch { throw new RequestError("Please check your study preferences."); }
    await rateLimit("journey", user.id, 180, 60000);
    return Response.json({ journey: await saveJourneyCommand(user.id, body.id, command) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return requestError(error, "Your changes have not been saved. Please try again."); }
}
