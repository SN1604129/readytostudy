"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, RotateCcw } from "lucide-react";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { levels, budgets } from "@/lib/courses";
import { useJourney } from "@/lib/journey";

/**
 * Quick Study Planner — "I want to study [level] in [country] with a
 * budget of [amount]."
 *
 * Uses native <select> elements so it is fully keyboard and screen-reader
 * accessible, works on mobile without custom widgets, and needs no account.
 * Choices are written to shared journey state and passed to the Course Finder.
 */
export function JourneyPlanner({ destinations = defaults }: { destinations?: Destination[] }) {
  const router = useRouter();
  const { journey, update, reset, persistent, user } = useJourney();

  const selectCls =
    "focus-ring mx-1 inline-block rounded-xl border-b-2 border-gold-500 bg-navy-50 px-3 py-1.5 font-bold text-navy-900";

  const go = () => {
    const params = new URLSearchParams();
    if (journey.destination) params.set("destination", journey.destination);
    if (journey.level) params.set("level", journey.level);
    if (journey.budget) params.set("budget", journey.budget);
    router.push(`/course-finder${params.toString() ? `?${params}` : ""}`);
  };

  const hasAny = Boolean(journey.destination || journey.level || journey.budget);

  return (
    <section id="plan" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-16 sm:px-6 md:py-20">
      <div className="rounded-3xl bg-white p-7 shadow-xl shadow-navy-900/10 ring-1 ring-navy-100 sm:p-10">
        <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
          Quick study planner
        </p>

        <h2 className="font-display mt-3 text-2xl leading-relaxed font-extrabold text-navy-950 md:text-3xl md:leading-relaxed">
          I want to study
          <label className="sr-only" htmlFor="plan-level">
            Study level
          </label>
          <select
            id="plan-level"
            className={selectCls}
            value={journey.level ?? ""}
            onChange={(e) => update({ level: (e.target.value || undefined) as typeof journey.level })}
          >
            <option value="">(any level)</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          in
          <label className="sr-only" htmlFor="plan-destination">
            Destination
          </label>
          <select
            id="plan-destination"
            className={selectCls}
            value={journey.destination ?? ""}
            onChange={(e) => update({ destination: e.target.value || undefined })}
          >
            <option value="">(anywhere)</option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
          with a budget that is
          <label className="sr-only" htmlFor="plan-budget">
            Budget comfort
          </label>
          <select
            id="plan-budget"
            className={selectCls}
            value={journey.budget ?? ""}
            onChange={(e) => update({ budget: (e.target.value || undefined) as typeof journey.budget })}
          >
            <option value="">(flexible)</option>
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
          .
        </h2>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={go}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-6 py-3 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105 active:scale-[0.98]"
          >
            {hasAny ? "See matching courses" : "Browse all courses"} <ArrowRight size={18} />
          </button>

          {hasAny && (
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold text-navy-900/60 hover:text-navy-700"
            >
              <RotateCcw size={15} /> Reset my plan
            </button>
          )}
        </div>

        <p className="mt-5 text-xs leading-relaxed text-navy-900/55">
          {user ? "Your choices are saved to your account and recorded in My history." : persistent
            ? "Your choices are saved on this device only, so tools across the site stay in step. No account needed, and you can reset them any time."
            : "Your choices apply for this visit. Saving is unavailable in this browser, so they will not carry over to your next visit."}
        </p>
      </div>
    </section>
  );
}
