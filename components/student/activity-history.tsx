"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { History, RefreshCw } from "lucide-react";
import type { Activity } from "@/lib/account-store";
type Enquiry = { id: string; receivedAt: string; destination: string; studyLevel: string; status: string; confirmation: string };

export function ActivityHistory() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback((before?: string) =>
    fetch(`/api/account/history${before ? `?before=${encodeURIComponent(before)}` : ""}`, { cache: "no-store" })
      .then(response => response.json().then(data => ({ response, data })))
      .then(({ response, data }) => {
      if (!response.ok) throw new Error(data.error || "Could not load your history.");
      setError("");
      setActivities(current => before ? [...current, ...data.activities.filter((item: Activity) => !current.some(existing => existing.id === item.id))] : data.activities);
      if (!before) setEnquiries(data.enquiries);
      setCursor(data.nextCursor);
      })
      .catch(failure => { setError(failure instanceof Error ? failure.message : "Could not load your history."); })
      .finally(() => setBusy(false)), []);
  useEffect(() => { void load(); }, [load]);

  return <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="text-xs font-bold tracking-widest text-gold-500 uppercase">Your account</p><h1 className="font-display mt-2 flex items-center gap-3 text-4xl font-extrabold text-navy-950"><History aria-hidden /> My history</h1>
      <p className="mt-3 max-w-xl text-navy-900/70">Your enquiries, advisor conversations, saved study changes and visits. Only you can view this history.</p></div>
      <button type="button" disabled={busy} onClick={() => { setBusy(true); void load(); }} className="focus-ring inline-flex items-center gap-2 rounded-full border border-navy-100 bg-white px-4 py-2 text-sm font-bold text-navy-700 disabled:opacity-50"><RefreshCw size={16} /> Refresh history</button>
    </div>
    <Link href="/student" className="mt-5 inline-block text-sm font-bold text-navy-700 underline">Back to your study plan</Link>
    {enquiries.length > 0 && <section aria-label="Your enquiries" className="mt-8 space-y-3">
      <h2 className="font-display text-2xl font-bold text-navy-950">Your enquiries</h2>
      {enquiries.map(item => <article key={item.id} className="rounded-2xl border border-navy-100 bg-white p-5">
        <p className="font-bold text-navy-900">{item.destination} · {item.studyLevel}</p>
        <p className="mt-1 break-all text-sm text-navy-700">Reference: RTS-{item.id.toUpperCase()}</p>
        <p className="mt-2 text-sm text-navy-700">Status: <span className="font-bold capitalize">{item.status}</span> · Confirmation email: {item.confirmation === "sent" ? "sent" : "pending"}</p>
      </article>)}
    </section>}
    {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <ol aria-label="Account activity" className="mt-8 space-y-4">
      {activities.map(item => <li key={item.id} className="min-w-0 rounded-2xl border border-navy-100 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-bold text-navy-900">{item.title}</h2><time dateTime={item.createdAt} className="text-xs text-navy-600">{new Date(item.createdAt).toLocaleString()}</time></div>
        {item.detail && <p className="mt-2 break-words text-sm text-navy-700">{item.detail}</p>}
        {item.exchange && <details className="mt-3 text-sm text-navy-800"><summary className="focus-ring cursor-pointer font-bold">Read conversation</summary>
          <p className="mt-3 break-words whitespace-pre-wrap"><strong>You:</strong> {item.exchange.question}</p>
          <p className="mt-3 break-words whitespace-pre-wrap"><strong>Advisor:</strong> {item.exchange.reply}</p>
          {item.exchange.sources.map(source => /^https:\/\//.test(source.url) && <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="mt-2 block break-words underline">{source.title}</a>)}
        </details>}
        {item.href && <Link href={item.href} className="focus-ring mt-3 inline-block text-xs font-bold text-navy-700 underline">Open page</Link>}
      </li>)}
    </ol>
    {busy && <p role="status" className="mt-6 text-sm text-navy-700">Loading your history…</p>}
    {!busy && !error && !activities.length && <p className="mt-6 rounded-2xl bg-white p-6 text-navy-700">Your account activity will appear here as you use the site.</p>}
    {cursor && <button type="button" disabled={busy} onClick={() => { setBusy(true); void load(cursor); }} className="focus-ring mt-6 rounded-full bg-navy-700 px-6 py-3 font-bold text-white disabled:opacity-50">Load older activity</button>}
  </section>;
}
