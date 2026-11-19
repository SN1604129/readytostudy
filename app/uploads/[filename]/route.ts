import { readFile } from "node:fs/promises";
import path from "node:path";
import { databaseConfigured, getDatabase } from "@/lib/persistent-data";

export const runtime = "nodejs";
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!/^\d{10,16}-[a-z0-9]{1,24}\.(jpg|png|webp|gif)$/.test(filename)) return new Response("Not found", { status: 404 });
  if (databaseConfigured()) {
    try {
      const sql = await getDatabase();
      const rows = await sql`SELECT bytes, content_type FROM rts_uploads WHERE filename = ${filename}`;
      if (!rows.length) return new Response("Not found", { status: 404 });
      return new Response(new Uint8Array(rows[0].bytes), { headers: { "Content-Type": rows[0].content_type, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=86400" } });
    } catch { return new Response("Image temporarily unavailable", { status: 503 }); }
  }
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(path.join(process.env.RTS_DATA_DIR || path.join(process.cwd(), "data"), "uploads", filename));
    const type = filename.endsWith("jpg") ? "image/jpeg" : `image/${filename.split(".").at(-1)}`;
    return new Response(new Uint8Array(bytes), { headers: { "Content-Type": type, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=86400" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
