"use client";
import { useEffect, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";

type Usage = { replies: number; searches: number; monthlySearches: number; tokens: number; configuration: { available: boolean; issues: string[] }; searchConfigured: boolean; storageError?: string };
export function AdvisorUsage() {
  const [usage, setUsage] = useState<Usage | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(true);
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let active = true;
    fetch("/api/admin/advisor", { cache: "no-store" })
      .then(response => { if (!response.ok) throw new Error(); return response.json(); })
      .then(data => { if (active) { setUsage(data); setError(""); } })
      .catch(() => { if (active) setError("Could not load advisor usage."); })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [version]);
  return <section className="mt-10 rounded-3xl border border-navy-100 bg-white p-6">
    <div className="flex items-center justify-between gap-3"><h2 className="font-display flex items-center gap-2 text-xl font-bold text-navy-900"><Sparkles size={20} /> AI advisor usage</h2><button type="button" disabled={busy} onClick={() => { setBusy(true); setVersion(v => v + 1); }} className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-navy-700"><RefreshCw size={16} className={busy ? "animate-spin" : ""} /> Refresh</button></div>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {usage && <><div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{[["AI attempts · 24h", `${usage.replies ?? 0}/60`], ["Fresh searches · 24h", `${usage.searches ?? 0}/25`], ["Search credits · 31 days", `${usage.monthlySearches ?? 0}/900`], ["Tokens used/reserved · 24h", `${(usage.tokens ?? 0).toLocaleString()}/180,000`]].map(([label, value]) => <div key={label} className="rounded-2xl bg-ice p-4"><p className="text-xs text-navy-600">{label}</p><p className="mt-1 font-display text-lg font-extrabold text-navy-900">{value}</p></div>)}</div>
      <p className="mt-4 text-sm font-semibold text-navy-700">Chat {usage.configuration.available ? "configured" : "paused"} · Search {usage.searchConfigured ? "configured" : "needs a Tavily key"}</p>
      {usage.storageError && <p className="mt-2 text-sm text-red-700">{usage.storageError}</p>}
      {usage.configuration.issues.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-amber-800">{usage.configuration.issues.map(issue => <li key={issue}>{issue}</li>)}</ul>}
      <p className="mt-3 text-xs leading-relaxed text-navy-600">Limits apply to everyone, including admins. Searches are cached for 24 hours. The 31-day search cap conservatively stays below the monthly free allowance. Failed provider attempts may still count. Keep Groq and Tavily on their free plans; this dashboard does not change provider billing settings.</p></>}
  </section>;
}
