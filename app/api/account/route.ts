import type { NextRequest } from "next/server";
import { getUserFromRequest, safeUser } from "@/lib/server-auth";
import { getAccount } from "@/lib/account-store";
import { requestError } from "@/lib/request-security";

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    return Response.json(user ? { user: safeUser(user), ...await getAccount(user.id) } : { user: null }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return requestError(error, "Could not load your account. Please try again."); }
}
