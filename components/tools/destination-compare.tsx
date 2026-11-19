"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, Save } from "lucide-react";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { getBudgetAssumption } from "@/lib/journey-content";
import { useJourney } from "@/lib/journey";

export function DestinationCompare({ destinations = defaults }: { destinations?: Destination[] }) {
  const { journey, update, addStamp } = useJourney();
  const [selected, setSelected] = useState<string[]>(
    journey.destination ? [journey.destination, "australia"].filter((v, i, a) => a.indexOf(v) === i) : ["australia", "malaysia"],
  );

  const visible = useMemo(
    () => destinations.filter((d) => selected.includes(d.slug)),
    [selected, destinations],
  );

  const toggle = (slug: string) => {
    setSelected((current) =>
      current.includes(slug)
        ? current.length > 1
          ? current.filter((s) => s !== slug)
          : current
        : [...current, slug].slice(-3),
    );
  };

  const savePreferred = (slug: string) => {
    update({ destination: slug });
    addStamp(slug);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
      <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
        <h2 className="font-display text-xl font-extrabold text-navy-950">Compare up to three</h2>
        <div className="mt-5 grid gap-2">
          {destinations.map((d) => (
            <label
              key={d.slug}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-navy-100 bg-ice px-4 py-3 text-sm font-semibold text-navy-900"
            >
              <input
                type="checkbox"
                checked={selected.includes(d.slug)}
                onChange={() => toggle(d.slug)}
                className="h-4 w-4 accent-navy-700"
              />
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.accent }} aria-hidden />
              {d.name}
            </label>
          ))}
        </div>
        <p className="mt-4 text-xs text-navy-900/55">
          Comparison data is limited to verified site content and editable budget assumptions.
        </p>

        <div className="mt-8 border-t border-navy-100 pt-6">
          <h3 className="font-display font-extrabold text-navy-950">Saved course shortlist</h3>
          {journey.savedCourses.length === 0 ? (
            <p className="mt-3 text-sm text-navy-900/60">
              Save courses from Course Finder and they will appear here for side-by-side planning.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {journey.savedCourses.map((course) => {
                const destination = destinations.find((d) => d.slug === course.destination);
                return (
                  <li key={course.title} className="rounded-2xl bg-ice p-4">
                    <p className="font-bold text-navy-900">{course.title}</p>
                    <p className="mt-1 text-sm text-navy-900/65">
                      {course.university} · {destination?.name ?? course.destination}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((d) => {
          const budget = getBudgetAssumption(d.slug);
          const saved = journey.destination === d.slug;
          return (
            <article key={d.slug} className="flex min-h-[32rem] flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-gold-500 uppercase">{d.short}</p>
                  <h3 className="font-display mt-1 text-2xl font-extrabold text-navy-950">{d.name}</h3>
                </div>
                <span
                  className="font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                  style={{ backgroundColor: d.accent }}
                >
                  {d.short}
                </span>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-navy-900/70">{d.tagline}</p>
              {d.badge && (
                <p className="mt-4 inline-flex self-start rounded-full bg-badge-red px-3 py-1 text-xs font-extrabold text-white uppercase">
                  {d.badge}
                </p>
              )}

              <div className="mt-5 space-y-3 text-sm">
                <p className="flex items-start gap-2 text-navy-900/75">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-gold-500" aria-hidden />
                  {d.cities.join(", ")}
                </p>
                <p className="text-navy-900/75">
                  <span className="font-bold text-navy-900">Living estimate:</span>{" "}
                  {budget?.livingPerYear
                    ? `${budget.currency} ${budget.livingPerYear.toLocaleString()} / year`
                    : "Needs verified figure"}
                </p>
                <p className="text-navy-900/75">
                  <span className="font-bold text-navy-900">Tuition:</span>{" "}
                  {budget?.tuitionMin && budget.tuitionMax
                    ? `${budget.currency} ${budget.tuitionMin.toLocaleString()}-${budget.tuitionMax.toLocaleString()}`
                    : "Confirmed during consultation"}
                </p>
              </div>

              <ul className="mt-5 space-y-2">
                {d.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2 text-sm text-navy-900/75">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: d.accent }} aria-hidden />
                    {h}
                  </li>
                ))}
              </ul>

              <div className="mt-auto flex flex-wrap gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => savePreferred(d.slug)}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-4 py-2.5 text-sm font-bold text-white"
                >
                  <Save size={16} /> {saved ? "Saved" : "Save"}
                </button>
                <Link
                  href={`/destinations/${d.slug}`}
                  className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-navy-200 px-4 py-2.5 text-sm font-bold text-navy-700"
                >
                  Details <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
