import { cookies } from "next/headers";
import { destroySession, getUserBySessionToken, SESSION_COOKIE } from "@/lib/server-auth";
import { requireSameOrigin, requestError } from "@/lib/request-security";
import { recordActivity } from "@/lib/account-store";

export async function POST(request: Request) {
  try { requireSameOrigin(request); } catch (error) { return requestError(error, "Could not log out."); }
  const cookieStore = await cookies();
  const user = await getUserBySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
  if (user) await recordActivity(user.id, { type: "account", title: "Logged out" });
  await destroySession(cookieStore.get(SESSION_COOKIE)?.value);
  cookieStore.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
