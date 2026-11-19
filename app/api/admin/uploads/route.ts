import { existsSync, mkdirSync, writeFileSync } from "fs";
import path from "path";
import type { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/server-auth";
import { databaseConfigured, getDatabase } from "@/lib/persistent-data";
import { recordActivity } from "@/lib/account-store";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) return auth.error;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Upload an image file." }, { status: 400 });
  }
  if (!allowedTypes.has(file.type)) {
    return Response.json({ error: "Only JPG, PNG, WEBP or GIF images are allowed." }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return Response.json({ error: "Please keep images under 4MB." }, { status: 400 });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extensionFor(file.type)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  if (databaseConfigured()) {
    const sql = await getDatabase();
    await sql`INSERT INTO rts_uploads (filename, content_type, bytes) VALUES (${filename}, ${file.type}, ${bytes})`;
  } else {
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return Response.json({ error: "Image storage is not configured yet." }, { status: 503 });
    const uploadDir = path.join(process.env.RTS_DATA_DIR || path.join(process.cwd(), "data"), "uploads");
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });
    writeFileSync(path.join(uploadDir, filename), bytes);
  }

  await recordActivity(auth.user.id, { type: "admin", title: "Image uploaded", href: `/uploads/${filename}` });
  return Response.json({ url: `/uploads/${filename}` });
}
