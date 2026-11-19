import { getCurrentUser, safeUser } from "@/lib/server-auth";

export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ user: user ? safeUser(user) : null });
}
