"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Gauge } from "lucide-react";
import { readinessSteps, useJourney } from "@/lib/journey";
import { Stamp } from "@/components/travel/stamp";

export function ReadinessDashboard() {
  const { journey } = useJourney();
  const completed = readinessSteps.filter((s) => s.done(journey)).length;
  const percent = Math.round((completed / readinessSteps.length) * 100);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="rounded-3xl bg-navy-950 p-8 text-white shadow-xl shadow-navy-900/20">
        <Gauge className="text-gold-400" size={34} aria-hidden />
        <p className="mt-6 text-sm font-bold text-gold-400 uppercase">Readiness score</p>
        <p className="font-display mt-2 text-6xl font-extrabold">{percent}%</p>
        {completed > 0 && (
          <div className="mt-5">
            <Stamp label="Plan" sublabel="Started" size={96} tone="gold" />
          </div>
        )}
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/15">
          <div className="h-full rounded-full bg-gold-500" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-navy-100/75">
          This is a planning progress indicator only. It is not an admission, scholarship or visa prediction.
        </p>
      </aside>

      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100 sm:p-8">
        <h2 className="font-display text-2xl font-extrabold text-navy-950">
          Your next best steps
        </h2>
        <ol className="mt-6 space-y-3">
          {readinessSteps.map((step) => {
            const done = step.done(journey);
            return (
              <li key={step.id} className="flex items-center gap-3 rounded-2xl bg-ice px-4 py-3">
                {done ? (
                  <CheckCircle2 size={20} className="shrink-0 text-gold-500" aria-hidden />
                ) : (
                  <Circle size={20} className="shrink-0 text-navy-200" aria-hidden />
                )}
                <span className="flex-1 font-semibold text-navy-900">{step.label}</span>
                {!done && (
                  <Link href={step.href} className="focus-ring inline-flex items-center gap-1 text-sm font-bold text-navy-700">
                    Start <ArrowRight size={14} />
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
