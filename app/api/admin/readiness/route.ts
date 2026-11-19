import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { databaseConfigured, getDatabase } from "@/lib/persistent-data";
import { emailConfiguration } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;
  let storageReady = false;
  if (databaseConfigured()) {
    try { await (await getDatabase())`SELECT 1`; storageReady = true; } catch { /* Return status without credentials or connection details. */ }
  } else if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) storageReady = Boolean(process.env.RTS_DATA_DIR);
  const email = emailConfiguration();
  const checks = [
    { name: "Persistent storage", ready: storageReady, detail: databaseConfigured() ? "PostgreSQL connection check" : "Connect PostgreSQL for Vercel, or set a persistent RTS_DATA_DIR on your server." },
    { name: "Administrator protection", ready: (process.env.ADMIN_INVITE_CODE?.length ?? 0) >= 32, detail: "Use a private ADMIN_INVITE_CODE of at least 32 characters." },
    { name: "Public website address", ready: Boolean(process.env.APP_ORIGIN?.startsWith("https://")), detail: "APP_ORIGIN must be your public HTTPS website address." },
    { name: "Email sending", ready: email.configured, detail: `From ${email.from}; enquiries to ${email.inbox}. A real email test is still required.` },
    { name: "Application secret", ready: (process.env.APP_SECRET?.length ?? 0) >= 32, detail: "Set a random APP_SECRET of at least 32 characters." },
  ];
  return Response.json({ checks, configured: checks.every(check => check.ready) }, { headers: { "Cache-Control": "no-store" } });
}
