"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowUpRight, Globe2, Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { budgets, fields, levels } from "@/lib/courses";
import { useJourney } from "@/lib/journey";
import { useAdvisor } from "./advisor-provider";
import { Turnstile } from "./turnstile";

export function AdvisorPanel({ compact = false }: { compact?: boolean }) {
  const advisor = useAdvisor();
  const { saveCourse, journey } = useJourney();
  const [token, setToken] = useState("");
  const [challenge, setChallenge] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const list = useRef<HTMLDivElement>(null);
  const id = useId();
  const { refresh, messages, busy, status, preferences: p, result } = advisor;
  useEffect(() => { void refresh(); const focus = () => void refresh(); window.addEventListener("focus", focus); return () => window.removeEventListener("focus", focus); }, [refresh]);
  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); }, [messages, busy]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  const waiting = advisor.cooldownUntil > now;
  const enabled = Boolean(status?.available && status.signedIn && status.remaining > 0 && !busy && !waiting && (!status.turnstileSiteKey || token));
  const samePreferences = result && ["destination", "level", "field", "budget"].every(key => result.preferences[key as keyof typeof p] === p[key as keyof typeof p]);
  const sources = samePreferences ? result?.sources ?? [] : [];
  const matches = samePreferences ? result?.courses ?? [] : [];
  const returnTo = encodeURIComponent(`/course-finder?${new URLSearchParams(Object.entries(p).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString()}`);
  const selectClass = "focus-ring min-w-0 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 text-xs text-navy-900 disabled:opacity-60";

  async function submit(text: string, mode: "chat" | "search" = "chat") {
    if (!enabled) return;
    await advisor.send(text, mode, token);
    setToken(""); setChallenge(n => n + 1);
  }

  return <section id={compact ? undefined : "course-advisor"} aria-label="AI course advisor" className="flex min-w-0 scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-navy-100 bg-white shadow-xl shadow-navy-900/5">
    <header className="bg-navy-800 px-5 py-4 text-white">
      <div className="flex items-center gap-3"><span className="rounded-xl bg-white/10 p-2"><Sparkles size={20} className="text-gold-400" /></span><div><h2 className="font-display text-lg font-extrabold">Your course advisor</h2><p className="text-xs text-white/75">Find your fit. Ask your next question.</p></div></div>
    </header>
    <div className="grid grid-cols-2 gap-2 border-b border-navy-100 bg-ice p-4">
      {([
        ["destination", "Country", advisor.destinations.map(d => ({ id: d.slug, label: d.name }))],
        ["level", "Study level", levels], ["field", "Subject", fields], ["budget", "Budget", budgets],
      ] as const).map(([key, label, options]) => <label key={key} className="min-w-0"><span className="mb-1 block text-[0.65rem] font-bold tracking-wide text-navy-700 uppercase">{label}</span><select className={selectClass} value={p[key] || ""} disabled={busy} onChange={e => advisor.setPreferences({ ...p, [key]: e.target.value || undefined })}><option value="">Choose {label.toLowerCase()}</option>{options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select></label>)}
    </div>
    <div ref={list} role="log" aria-label="Advisor conversation" aria-live="polite" aria-relevant="additions" className={`space-y-3 overflow-y-auto overscroll-contain p-4 ${compact ? "max-h-[30dvh] min-h-36" : "max-h-96 min-h-52"}`}>
      <div className="rounded-2xl rounded-tl-sm bg-ice p-4 text-sm leading-relaxed text-navy-900">Hi! Choose your preferences above, then ask me to explain your options or search official university pages. English বা বাংলা—দুটোতেই কথা বলতে পারেন।</div>
      {messages.map((m, i) => <div key={i} className={`max-w-[94%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "ml-auto rounded-br-sm bg-navy-700 text-white" : "rounded-bl-sm bg-ice text-navy-900"}`}>{m.content}</div>)}
      {busy && <p className="flex items-center gap-2 text-sm text-navy-700"><Loader2 size={16} className="animate-spin" /> Checking your options…</p>}
    </div>
    {(sources.length > 0 || matches.length > 0) && <div className="max-h-72 space-y-2 overflow-y-auto border-t border-navy-100 px-4 py-3">
      {matches.map(({ course }) => <article key={course.title + course.university} className="rounded-xl border border-navy-100 p-3"><p className="text-[0.65rem] font-bold text-navy-600 uppercase">Reviewed catalogue entry</p><h3 className="mt-1 text-sm font-bold text-navy-900">{course.title}</h3><p className="text-xs text-navy-700">{course.university}</p><button type="button" className="focus-ring mt-2 text-xs font-bold text-navy-700 underline" onClick={() => saveCourse(course)}>{journey.savedCourses.some(c => c.title === course.title) ? "Saved to shortlist" : "Save course"}</button></article>)}
      {sources.length > 0 && <p className="text-[0.65rem] font-bold tracking-wide text-navy-600 uppercase">University web results · {result?.cached ? "saved within 24 hours" : "just retrieved"}</p>}
      {sources.map((source, i) => <article key={source.url} className="rounded-xl border border-navy-100 p-3"><a href={source.url} target="_blank" rel="noopener noreferrer" className="focus-ring flex items-start gap-2 text-sm font-bold text-navy-800"><span>[{i + 1}] {source.title}</span><ArrowUpRight size={16} className="shrink-0" /></a><p className="mt-1 text-xs text-navy-600">{source.domain}</p><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-navy-700">{source.excerpt}</p><p className="mt-2 text-[0.65rem] text-navy-500">Check the university page for current fees and availability.</p></article>)}
    </div>}
    <div className="space-y-3 border-t border-navy-100 p-4">
      {!status && <p className="text-xs text-navy-600">Checking availability…</p>}
      {status && !status.available && <p role="status" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{status.reason} <Link href="/contact" className="font-bold underline">Talk to a counsellor</Link></p>}
      {status && !status.signedIn && <div className="rounded-xl bg-ice p-3 text-sm text-navy-800"><Link href={`/login?next=${returnTo}`} className="font-bold underline">Log in</Link> or <Link href={`/signup?next=${returnTo}`} className="font-bold underline">create an account</Link> to use the advisor and save conversations to your private history.</div>}
      {status?.signedIn && <p className="text-xs text-navy-600">{status.remaining} of 5 replies left · {status.searchesRemaining} fresh search left{status.remaining === 0 && status.resetAt ? ` · Next reply ${new Date(status.resetAt).toLocaleString()}` : ""}</p>}
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={!enabled} onClick={() => void submit("Explain which listed courses match my preferences.")} className="focus-ring rounded-full border border-navy-100 px-3 py-2 text-xs font-bold text-navy-700 disabled:opacity-40">Explain my matches</button>
        <button type="button" disabled={!enabled} onClick={() => void submit("Show cheaper options.")} className="focus-ring rounded-full border border-navy-100 px-3 py-2 text-xs font-bold text-navy-700 disabled:opacity-40">Cheaper options</button>
        <button type="button" disabled={!enabled || !status?.searchAvailable || !p.destination || !p.level || !p.field} onClick={() => void submit("Find official university course pages for my selected preferences.", "search")} className="focus-ring inline-flex items-center gap-1 rounded-full bg-gold-100 px-3 py-2 text-xs font-bold text-navy-900 disabled:opacity-40"><Globe2 size={13} /> Search universities</button>
      </div>
      {status?.available && status.signedIn && status.turnstileSiteKey && <Turnstile key={challenge} siteKey={status.turnstileSiteKey} onToken={setToken} />}
      <form onSubmit={e => { e.preventDefault(); void submit(advisor.draft); }} className="flex items-end gap-2">
        <label htmlFor={id} className="sr-only">Ask your course question</label>
        <textarea id={id} rows={2} maxLength={800} value={advisor.draft} disabled={busy} onChange={e => advisor.setDraft(e.target.value)} placeholder="Ask about your courses…" className="focus-ring min-w-0 flex-1 resize-none rounded-2xl border border-navy-100 bg-ice px-3 py-2 text-sm text-navy-900" />
        <button type="submit" aria-label="Send question" disabled={!enabled || !advisor.draft.trim()} className="focus-ring rounded-full bg-navy-700 p-3 text-white disabled:opacity-40">{busy ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}</button>
      </form>
      {waiting && <p role="status" className="text-xs text-navy-600">Please wait {Math.max(1, Math.ceil((advisor.cooldownUntil - now) / 1000))} seconds before another request.</p>}
      <p className="text-[0.65rem] leading-relaxed text-navy-500">Conversations are saved in your account history. Questions and preferences are sent to our AI and search providers. Please leave out sensitive documents and personal financial details.</p>
      {status?.signedIn && <Link href="/student/history" className="text-xs font-bold text-navy-700 underline">My conversation history</Link>}
      <Link href="/contact" className="focus-ring inline-flex items-center gap-1 text-xs font-bold text-navy-700"><MessageCircle size={13} /> Prefer a person? Talk to a counsellor</Link>
    </div>
  </section>;
}
