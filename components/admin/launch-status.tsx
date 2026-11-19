"use client";
import { useEffect, useState } from "react";

type Check = { name: string; ready: boolean; detail: string };
export function LaunchStatus() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    fetch("/api/admin/readiness").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error("Could not check launch configuration.");
      if (active) setChecks(data.checks);
    }).catch(() => { if (active) setError("Could not check launch configuration."); });
    return () => { active = false; };
  }, []);
  return <details className="mt-8 rounded-2xl bg-white p-5 ring-1 ring-navy-100" open>
    <summary className="focus-ring cursor-pointer font-bold text-navy-950">Launch configuration · {checks.length ? `${checks.filter(check => check.ready).length}/${checks.length} configured` : "checking..."}</summary>
    <p className="mt-2 text-xs text-navy-900/60">Configuration checks help with setup. Confirm domain ownership, backups, and a real enquiry and email before launching.</p>
    {error && <p role="status" className="mt-3 text-sm text-red-700">{error}</p>}
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">{checks.map(check => <li key={check.name} className="rounded-xl bg-ice p-3 text-sm"><span className={`font-bold ${check.ready ? "text-green-700" : "text-amber-700"}`}>{check.ready ? "✓" : "○"} {check.name}</span><p className="mt-1 break-words text-xs text-navy-900/65">{check.detail}</p></li>)}</ul>
  </details>;
}
