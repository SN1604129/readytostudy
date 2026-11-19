import { readDocument, mutateDocument } from "../persistent-data.ts";
import { LIMITS, QuotaError } from "./limits.ts";

type Receipt = { id: string; user: string; ip: string; created: number; tokens: number; searches: number; busyUntil: number; response?: unknown };
const DAY = 86400000;
const KEY = "advisor-receipts";
const recent = (rows: Receipt[], now: number) => rows.filter(row => row.created > now - DAY);
const sum = (rows: Receipt[], field: "tokens" | "searches") => rows.reduce((total, row) => total + row[field], 0);
function usage(rows: Receipt[], user: string, now: number) {
  const today = recent(rows, now).filter(row => row.user === user);
  return { remaining: Math.max(0, LIMITS.userDaily - today.length), searchesRemaining: Math.max(0, LIMITS.userSearchDaily - sum(today, "searches")), resetAt: today.length ? new Date(Math.min(...today.map(row => row.created)) + DAY).toISOString() : undefined };
}

/** PostgreSQL serializes reservations across every Vercel instance. */
export class CloudAdvisorStore {
  async usage(user: string, now = Date.now()) { return usage(await readDocument<Receipt[]>(KEY, []), user, now); }
  async previous(id: string, user: string) { return (await readDocument<Receipt[]>(KEY, [])).find(row => row.id === id && row.user === user)?.response ?? null; }
  async reserve(input: { id: string; user: string; ip: string; tokens: number; search: boolean }, now = Date.now()) {
    await mutateDocument<Receipt[], void>(KEY, [], stored => {
      const rows = stored.filter(row => row.created >= now - 32 * DAY);
      if (rows.some(row => row.id === input.id)) throw new QuotaError("This request was already received. Please wait for its result.");
      const last = rows.filter(row => row.user === input.user).sort((a, b) => b.created - a.created)[0];
      if (last?.busyUntil > now) throw new QuotaError("Your previous reply is still being prepared.", 10);
      if (last && now - last.created < LIMITS.cooldownSeconds * 1000) throw new QuotaError("Please wait a moment before sending another message.", Math.ceil((last.created + LIMITS.cooldownSeconds * 1000 - now) / 1000));
      const userUsage = usage(rows, input.user, now);
      if (!userUsage.remaining) throw new QuotaError("You have used your five AI replies. You can still browse courses or speak with a counsellor.", Math.ceil((Date.parse(userUsage.resetAt!) - now) / 1000));
      const today = recent(rows, now);
      if (today.length >= LIMITS.siteDaily || sum(today, "tokens") + input.tokens > LIMITS.tokensDaily) throw new QuotaError("Today's shared AI allowance is used up. Course browsing and counselling are still available.", 3600);
      if (sum(rows.filter(row => row.created > now - 60000), "tokens") + input.tokens > LIMITS.tokensMinute) throw new QuotaError("The advisor is busy. Please try again in one minute.", 60);
      if (input.ip && today.filter(row => row.ip === input.ip).length >= LIMITS.ipDaily) throw new QuotaError("The AI allowance for this network is used up. Please try again later.", 3600);
      if (input.search && (!userUsage.searchesRemaining || sum(today, "searches") >= LIMITS.siteSearchDaily || sum(rows.filter(row => row.created > now - 31 * DAY), "searches") >= LIMITS.searchMonthly)) throw new QuotaError("The fresh-search allowance is used up. You can still use saved results and browse listed courses.", 3600);
      rows.push({ ...input, created: now, searches: input.search ? 1 : 0, busyUntil: now + 90000 });
      return { value: rows, result: undefined };
    });
  }
  async finish(id: string, response: unknown, actualTokens?: number) {
    await mutateDocument<Receipt[], void>(KEY, [], rows => ({
      value: rows.map(row => row.id === id ? { ...row, response, busyUntil: 0, tokens: actualTokens !== undefined && actualTokens >= 0 ? actualTokens : row.tokens } : row), result: undefined,
    }));
  }
  async cached<T>(key: string, now = Date.now()): Promise<T | null> {
    const cache = await readDocument<Record<string, { value: T; expires: number }>>("advisor-cache", {});
    return cache[key]?.expires > now ? cache[key].value : null;
  }
  async cache(key: string, value: unknown, now = Date.now()) {
    await mutateDocument<Record<string, { value: unknown; expires: number }>, void>("advisor-cache", {}, cache => ({
      value: { ...Object.fromEntries(Object.entries(cache).filter(([, item]) => item.expires > now)), [key]: { value, expires: now + DAY } }, result: undefined,
    }));
  }
  async overview(now = Date.now()) {
    const rows = await readDocument<Receipt[]>(KEY, []);
    const today = recent(rows, now);
    return { replies: today.length, tokens: sum(today, "tokens"), searches: sum(today, "searches"), monthlySearches: sum(rows.filter(row => row.created > now - 31 * DAY), "searches"), limits: LIMITS };
  }
}
