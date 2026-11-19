import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/server-auth";
import { getCmsCourses } from "@/lib/cms-courses";
import { getCmsDestinations } from "@/lib/cms-destinations";
import { exactMatches, parsePreferences, preferenceSummary, refinePreferences } from "@/lib/advisor/preferences";
import { askGroq, preparePrompt, searchKey, searchUniversities, universityDomains } from "@/lib/advisor/providers";
import { advisorConfiguration, assertOrigin, boundedJson, requestIp, verifyTurnstile } from "@/lib/advisor/security";
import { getAdvisorStore, QuotaError } from "@/lib/advisor/store";
import type { AdvisorMessage, AdvisorReply, AdvisorStatus, Preferences, Source } from "@/lib/advisor/types";
import { getAccount, recordActivity } from "@/lib/account-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function json(body: unknown, status = 200, retryAfter?: number) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "private, no-store", ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}) } });
}

async function getStatus(userId?: string): Promise<AdvisorStatus> {
  const config = advisorConfiguration();
  let usage = { remaining: 5, searchesRemaining: 1, resetAt: undefined as string | undefined };
  try { if (userId) usage = await getAdvisorStore().usage(userId); }
  catch { return { available: false, searchAvailable: false, signedIn: Boolean(userId), userId, ...usage, turnstileSiteKey: "", reason: "The advisor is temporarily unavailable. You can still browse courses." }; }
  return { available: config.available, searchAvailable: config.searchAvailable, signedIn: Boolean(userId), userId, ...usage,
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "", reason: config.available ? undefined : "AI chat is not available yet. Browse courses or speak with a counsellor." };
}

export async function GET(request: NextRequest) { return json(await getStatus((await getUserFromRequest(request))?.id)); }

export async function POST(request: NextRequest) {
  let preferences: Preferences = {};
  let sources: Source[] = [];
  let courses: AdvisorReply["courses"] = [];
  const user = await getUserFromRequest(request);
  let question = "";
  let requestId = "";
  let mode = "chat";
  const saveExchange = async (reply: string) => {
    if (user && question && requestId) await recordActivity(user.id, { id: `chat-${requestId}`, type: "chat", title: mode === "search" ? "University search" : "Advisor conversation", exchange: { question, reply, sources } });
  };
  const fallback = async (reply: string, code: number, retryAfter?: number) => {
    await saveExchange(reply);
    return json({ reply, preferences, courses, sources, fallback: true, status: await getStatus(user?.id), retryAfter }, code, retryAfter);
  };
  try { assertOrigin(request); } catch { return fallback("Please send your request from this website.", 403); }
  if (!user) return fallback("Sign in to use your free AI replies. You can browse the course list without signing in.", 401);
  let body: Record<string, unknown>;
  let messages: AdvisorMessage[];
  try {
    body = await boundedJson(request);
    if (typeof body.requestId !== "string" || !/^[a-f0-9-]{36}$/.test(body.requestId)) throw new Error("Invalid request identifier.");
    if (body.mode !== "chat" && body.mode !== "search") throw new Error("Invalid advisor action.");
    preferences = parsePreferences(body.preferences, (await getCmsDestinations()).map(d => d.slug));
    if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 6) throw new Error("Please send a short conversation.");
    messages = body.messages.map((m: unknown) => {
      if (!m || typeof m !== "object") throw new Error("Invalid message.");
      const item = m as Record<string, unknown>;
      if ((item.role !== "user" && item.role !== "assistant") || typeof item.content !== "string" || !item.content.trim() || item.content.length > 2000) throw new Error("Invalid message.");
      return { role: item.role, content: item.content.trim() };
    });
    if (messages.at(-1)?.role !== "user" || Buffer.byteLength(messages.at(-1)!.content) > 2400) throw new Error("Please send a shorter question (up to 800 characters).");
    question = messages.at(-1)!.content;
    requestId = body.requestId as string;
    mode = body.mode as string;
    messages = [...(await getAccount(user.id)).conversation.slice(-4), { role: "user", content: question }];
    preferences = parsePreferences(refinePreferences(preferences, messages.at(-1)!.content), (await getCmsDestinations()).map(d => d.slug));
    courses = exactMatches((await getCmsCourses()).filter(c => c.verified), preferences);
    if (body.mode === "search" && (!preferences.destination || !preferences.level || !preferences.field || !universityDomains[preferences.destination])) throw new Error("Choose your country, study level and subject before searching university pages.");
  } catch (error) { return fallback(error instanceof Error ? error.message : "Invalid request.", 400); }
  const config = advisorConfiguration();
  if (!config.available) return fallback("AI chat is not available yet. Your course list and free counselling are still available.", 503);
  if (body.mode === "search" && !config.searchAvailable) return fallback("Live university search is not available yet. You can still ask about listed courses.", 503);
  let id = "";
  let reserved = false;
  try {
    const store = getAdvisorStore();
    id = `${user.id}:${body.requestId}`;
    const previous = await store.previous(id, user.id);
    if (previous) { sources = (previous as AdvisorReply).sources; await saveExchange((previous as AdvisorReply).reply); return json({ ...(previous as AdvisorReply), status: await getStatus(user.id) }); }
    const cached = await store.cached<Source[]>(searchKey(preferences));
    sources = cached ?? [];
    const freshSearch = body.mode === "search" && cached === null;
    const context = () => JSON.stringify({ preferences, summary: preferenceSummary(preferences), courses: courses.map(({ course: c }) => ({ title: c.title, university: c.university, level: c.level, budget: c.budget, tuition: c.tuitionPerYear, currency: c.currency, intake: c.nextIntake })).slice(0, 3), sources: sources.slice(0, 3).map((s, i) => ({ number: i + 1, title: s.title.slice(0, 100), excerpt: s.excerpt.slice(0, 320), retrieved: s.checkedAt })) });
    const initial = preparePrompt(context(), messages);
    await verifyTurnstile(body.turnstileToken);
    await store.reserve({ id, user: user.id, ip: requestIp(request), tokens: freshSearch ? 7200 : initial.reservedTokens, search: freshSearch });
    reserved = true;
    let searchFailed = false;
    if (freshSearch) {
      try { sources = await searchUniversities(preferences); await store.cache(searchKey(preferences), sources); }
      catch { searchFailed = true; }
    }
    const answer = await askGroq(preparePrompt(context(), messages).messages);
    const reply: AdvisorReply = { reply: `${searchFailed ? "Live search is temporarily unavailable; the answer below uses only existing information.\n\n" : ""}${answer.reply}`, courses, sources, preferences, cached: cached !== null, status: await getStatus(user.id) };
    await saveExchange(reply.reply);
    await store.finish(id, reply, answer.tokens);
    return json(reply);
  } catch (error) {
    if (error instanceof QuotaError) return fallback(error.message, 429, error.retryAfter);
    if (!reserved && error instanceof Error && /security|Security|connection|shorten/.test(error.message)) return fallback(error.message, 400);
    const reply: AdvisorReply = { reply: "The advisor could not complete this reply. Your course results are still below. Please try again later or speak with a counsellor. An attempted provider call may count toward today's allowance.", preferences, courses, sources, fallback: true, status: await getStatus(user.id) };
    await saveExchange(reply.reply);
    if (reserved) { try { await getAdvisorStore().finish(id, reply); } catch { /* Keep the reservation if storage is unavailable. */ } }
    console.error("[advisor] request unavailable", error instanceof Error ? error.name : "unknown");
    return json(reply, 503);
  }
}
