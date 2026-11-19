import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { databaseConfigured } from "../persistent-data.ts";
import { CloudAdvisorStore } from "./cloud-store.ts";
import { LIMITS, QuotaError } from "./limits.ts";
export { LIMITS, QuotaError } from "./limits.ts";

const DAY = 86400000;

export class AdvisorStore {
  db: DatabaseSync;
  constructor(filename: string) {
    if (filename !== ":memory:") mkdirSync(path.dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, ip TEXT NOT NULL, created INTEGER NOT NULL, tokens INTEGER NOT NULL, searches INTEGER NOT NULL, busy_until INTEGER NOT NULL, response TEXT);
      CREATE INDEX IF NOT EXISTS requests_created ON requests(created);
      CREATE INDEX IF NOT EXISTS requests_user ON requests(user_id, created);
      CREATE TABLE IF NOT EXISTS search_cache (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires INTEGER NOT NULL);`);
  }
  private sum(column: "tokens" | "searches", since: number, user?: string) {
    const row = this.db.prepare(`SELECT COALESCE(SUM(${column}),0) AS n FROM requests WHERE created > ?${user ? " AND user_id = ?" : ""}`).get(...(user ? [since, user] : [since]));
    return Number(row?.n ?? 0);
  }
  usage(user: string, now = Date.now()) {
    const row = this.db.prepare("SELECT COUNT(*) AS n, MIN(created) AS first FROM requests WHERE user_id = ? AND created > ?").get(user, now - DAY);
    return { remaining: Math.max(0, LIMITS.userDaily - Number(row?.n ?? 0)), searchesRemaining: Math.max(0, LIMITS.userSearchDaily - this.sum("searches", now - DAY, user)), resetAt: row?.first ? new Date(Number(row.first) + DAY).toISOString() : undefined };
  }
  previous(id: string, user: string) {
    const row = this.db.prepare("SELECT response FROM requests WHERE id = ? AND user_id = ?").get(id, user);
    return row?.response ? JSON.parse(String(row.response)) : null;
  }
  reserve(input: { id: string; user: string; ip: string; tokens: number; search: boolean }, now = Date.now()) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      // Rolling windows remain conservative across provider reset boundaries.
      this.db.prepare("DELETE FROM requests WHERE created < ?").run(now - 32 * DAY);
      this.db.prepare("DELETE FROM search_cache WHERE expires < ?").run(now);
      if (this.db.prepare("SELECT id FROM requests WHERE id = ?").get(input.id)) throw new QuotaError("This request was already received. Please wait for its result.");
      const last = this.db.prepare("SELECT created, busy_until FROM requests WHERE user_id = ? ORDER BY created DESC LIMIT 1").get(input.user);
      if (last && Number(last.busy_until) > now) throw new QuotaError("Your previous reply is still being prepared.", 10);
      if (last && now - Number(last.created) < LIMITS.cooldownSeconds * 1000) throw new QuotaError("Please wait a moment before sending another message.", Math.ceil((Number(last.created) + LIMITS.cooldownSeconds * 1000 - now) / 1000));
      const userUsage = this.usage(input.user, now);
      if (!userUsage.remaining) throw new QuotaError("You have used your five AI replies. You can still browse courses or speak with a counsellor.", Math.ceil((Date.parse(userUsage.resetAt!) - now) / 1000));
      const count = Number(this.db.prepare("SELECT COUNT(*) AS n FROM requests WHERE created > ?").get(now - DAY)?.n ?? 0);
      if (count >= LIMITS.siteDaily || this.sum("tokens", now - DAY) + input.tokens > LIMITS.tokensDaily) throw new QuotaError("Today's shared AI allowance is used up. Course browsing and counselling are still available.", 3600);
      if (this.sum("tokens", now - 60000) + input.tokens > LIMITS.tokensMinute) throw new QuotaError("The advisor is busy. Please try again in one minute.", 60);
      if (input.ip && Number(this.db.prepare("SELECT COUNT(*) AS n FROM requests WHERE ip = ? AND created > ?").get(input.ip, now - DAY)?.n ?? 0) >= LIMITS.ipDaily) throw new QuotaError("The AI allowance for this network is used up. Please try again later.", 3600);
      if (input.search && (!userUsage.searchesRemaining || this.sum("searches", now - DAY) >= LIMITS.siteSearchDaily || this.sum("searches", now - 31 * DAY) >= LIMITS.searchMonthly)) throw new QuotaError("The fresh-search allowance is used up. You can still use saved results and browse listed courses.", 3600);
      this.db.prepare("INSERT INTO requests (id,user_id,ip,created,tokens,searches,busy_until) VALUES (?,?,?,?,?,?,?)").run(input.id, input.user, input.ip, now, input.tokens, input.search ? 1 : 0, now + 90000);
      this.db.exec("COMMIT");
    } catch (error) { this.db.exec("ROLLBACK"); throw error; }
  }
  finish(id: string, response: unknown, actualTokens?: number) {
    // Failed/ambiguous calls keep their reservation; no automatic retries or refunds.
    this.db.prepare("UPDATE requests SET response = ?, busy_until = 0, tokens = CASE WHEN ? >= 0 THEN ? ELSE tokens END WHERE id = ?").run(JSON.stringify(response), actualTokens ?? -1, actualTokens ?? -1, id);
  }
  cached<T>(key: string, now = Date.now()): T | null {
    const row = this.db.prepare("SELECT value FROM search_cache WHERE key = ? AND expires > ?").get(key, now);
    return row ? JSON.parse(String(row.value)) as T : null;
  }
  cache(key: string, value: unknown, now = Date.now()) {
    this.db.prepare("INSERT OR REPLACE INTO search_cache (key,value,expires) VALUES (?,?,?)").run(key, JSON.stringify(value), now + DAY);
  }
  overview(now = Date.now()) {
    return { replies: Number(this.db.prepare("SELECT COUNT(*) AS n FROM requests WHERE created > ?").get(now - DAY)?.n ?? 0), tokens: this.sum("tokens", now - DAY), searches: this.sum("searches", now - DAY), monthlySearches: this.sum("searches", now - 31 * DAY), limits: LIMITS };
  }
}

let instance: AdvisorStore | undefined;
const cloud = new CloudAdvisorStore();
export function getAdvisorStore() {
  if (databaseConfigured()) return cloud;
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) throw new Error("Persistent advisor storage is required on this host.");
  if (process.env.NODE_ENV === "production" && !process.env.RTS_DATA_DIR) throw new Error("Set RTS_DATA_DIR to persistent storage.");
  return instance ??= new AdvisorStore(path.join(process.env.RTS_DATA_DIR || path.join(process.cwd(), "data"), "advisor.sqlite"));
}
