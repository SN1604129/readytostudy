import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import postgres from "postgres";

export const databaseConfigured = () => Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);
const serverless = () => Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
let database: ReturnType<typeof postgres> | undefined;
let initialized: Promise<void> | undefined;

// Earlier writes encoded JSON twice. Read those records without changing their
// contents; the next successful mutation writes the native JSONB representation.
export function decodeStoredDocument<T>(value: unknown): T {
  if (typeof value === "string" && /^[\[{]/.test(value.trim())) {
    try {
      const decoded: unknown = JSON.parse(value);
      if (decoded && typeof decoded === "object") return decoded as T;
    } catch { /* Leave a genuine string value intact. */ }
  }
  return value as T;
}

export async function getDatabase() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error("Online storage is not configured yet. Please contact the team.");
  database ??= postgres(url, { max: 2, idle_timeout: 20, connect_timeout: 10, prepare: false, onnotice: () => {} });
  const sql = database;
  initialized ??= (async () => {
    await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(hashtext('rts:schema-v1'))`;
      await tx`CREATE TABLE IF NOT EXISTS rts_documents (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
      await tx`CREATE TABLE IF NOT EXISTS rts_uploads (filename TEXT PRIMARY KEY, content_type TEXT NOT NULL, bytes BYTEA NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    });
  })().catch((error) => { initialized = undefined; throw error; });
  await initialized;
  return sql;
}

function localPath(key: string) {
  if (!/^[a-z0-9-]+$/.test(key)) throw new Error("Invalid storage key.");
  return path.join(process.env.RTS_DATA_DIR || path.join(process.cwd(), "data"), `${key}.json`);
}

export async function readDocument<T>(key: string, fallback: T): Promise<T> {
  if (databaseConfigured()) {
    const sql = await getDatabase();
    const rows = await sql`SELECT value FROM rts_documents WHERE key = ${key}`;
    return rows.length ? decodeStoredDocument<T>(rows[0].value) : fallback;
  }
  // Never read or write bundled account records on an ephemeral host.
  if (serverless()) return fallback;
  const filename = localPath(key);
  if (!existsSync(filename)) return fallback;
  return JSON.parse(readFileSync(filename, "utf8")) as T;
}

/** The read, callback and write are one transaction, including on first use. */
export async function mutateDocument<T, R>(key: string, fallback: T, change: (value: T) => { value: T; result: R }): Promise<R> {
  if (databaseConfigured()) {
    const sql = await getDatabase();
    const result = await sql.begin(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(hashtext(${'rts:' + key}))`;
      const rows = await tx`SELECT value FROM rts_documents WHERE key = ${key}`;
      const updated = change(rows.length ? decodeStoredDocument<T>(rows[0].value) : fallback);
      await tx`INSERT INTO rts_documents (key, value) VALUES (${key}, ${tx.json(updated.value as postgres.JSONValue)})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`;
      return { result: updated.result };
    });
    return result.result as R;
  }
  if (serverless()) throw new Error("Online storage is not configured yet. Please contact the team.");
  const filename = localPath(key);
  // Keep the local operation synchronous so requests cannot interleave writes.
  const current = existsSync(filename) ? JSON.parse(readFileSync(filename, "utf8")) as T : fallback;
  const updated = change(current);
  mkdirSync(path.dirname(filename), { recursive: true });
  const temporary = `${filename}.${randomUUID()}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(updated.value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, filename);
  return updated.result;
}

export async function writeDocument<T>(key: string, value: T) {
  return mutateDocument(key, value, () => ({ value, result: value }));
}
