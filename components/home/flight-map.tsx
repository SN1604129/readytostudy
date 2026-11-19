"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { useJourney } from "@/lib/journey";

const reviewAreas = [
  {
    label: "Course fit",
    text: "Entry requirements, career goals and intake timing.",
    icon: GraduationCap,
  },
  {
    label: "Scholarship options",
    text: "Partner offers and funding you may actually qualify for.",
    icon: BookOpenCheck,
  },
  {
    label: "Visa readiness",
    text: "Documents, financial evidence and next-step preparation.",
    icon: ClipboardCheck,
  },
];

/**
 * Destination comparison panel.
 *
 * The component name is kept for existing imports, but the UI is deliberately
 * education-first: no flight paths, route maps or ticketing metaphors.
 */
export function FlightMap({ destinations = defaults }: { destinations?: Destination[] }) {
  const [selected, setSelected] = useState(destinations[0].slug);
  const { addStamp } = useJourney();
  const reduce = useReducedMotion();

  const active = destinations.find((d) => d.slug === selected) ?? destinations[0];
  const showFullImage = Boolean(active.image) && active.imageFit === "contain";

  const choose = (slug: string) => {
    setSelected(slug);
    addStamp(slug);
  };

  return (
    <section className="bg-navy-950 py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-400 uppercase">
          Destination comparison
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display mt-3 max-w-2xl text-3xl font-extrabold text-white md:text-4xl">
            Choose a study destination with counsellor-level context
          </h2>
          <Link href="/destinations" className="focus-ring font-semibold text-gold-400 hover:underline">
            All destinations →
          </Link>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          <article className="overflow-hidden rounded-3xl bg-white text-navy-950 shadow-2xl shadow-black/20">
            <div
              className={`relative bg-navy-900 ${showFullImage ? "max-h-[40rem]" : "aspect-[16/10] min-h-72"}`}
              style={showFullImage ? { aspectRatio: `${active.imageSize?.width ?? 1080} / ${active.imageSize?.height ?? 1350}` } : undefined}
            >
              {active.image && (
                <motion.div
                  key={active.slug}
                  initial={reduce ? false : { opacity: 0.25, scale: showFullImage ? 1 : 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={active.image}
                    unoptimized={active.image.startsWith("https://")}
                    alt={`Study destination profile for ${active.name}`}
                    fill
                    sizes="(min-width: 1024px) 58vw, 92vw"
                    className={showFullImage ? "object-contain" : "object-cover"}
                    priority={active.slug === "australia"}
                  />
                </motion.div>
              )}
              {!showFullImage && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-950/85 to-transparent p-6 text-white">
                <p className="text-[0.65rem] font-extrabold tracking-[0.18em] text-gold-400 uppercase">
                  Study destination
                </p>
                <h3 className="font-display mt-1 text-3xl font-extrabold">
                  {active.name}
                </h3>
              </div>}
            </div>

            <div className="p-6 sm:p-8">
              {showFullImage && <div className="mb-4">
                <p className="text-[0.65rem] font-extrabold tracking-[0.18em] text-gold-500 uppercase">Study destination</p>
                <h3 className="font-display mt-1 text-3xl font-extrabold">{active.name}</h3>
              </div>}
              <p className="max-w-2xl text-navy-900/75">{active.intro}</p>

              {active.badge && (
                <p className="mt-5 inline-flex rounded-full bg-badge-red px-4 py-1.5 text-xs font-extrabold text-white uppercase">
                  {active.badge}
                </p>
              )}

              <dl className="mt-7 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-ice p-4">
                  <dt className="text-[0.62rem] font-extrabold tracking-[0.16em] text-navy-900/45 uppercase">
                    Student cities
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-navy-950">
                    {active.cities.slice(0, 3).join(", ")}
                  </dd>
                </div>
                <div className="rounded-2xl bg-ice p-4">
                  <dt className="text-[0.62rem] font-extrabold tracking-[0.16em] text-navy-900/45 uppercase">
                    Scholarship note
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-navy-950">
                    {active.badge ?? "Checked by profile"}
                  </dd>
                </div>
                <div className="rounded-2xl bg-ice p-4">
                  <dt className="text-[0.62rem] font-extrabold tracking-[0.16em] text-navy-900/45 uppercase">
                    Support
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-navy-950">
                    Admissions + visa prep
                  </dd>
                </div>
              </dl>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href={`/destinations/${active.slug}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 active:scale-[0.98]"
                >
                  Explore {active.name} <ArrowRight size={16} />
                </Link>
                <Link
                  href={`/course-finder?destination=${active.slug}`}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-2.5 text-sm font-bold text-navy-950 transition-transform hover:scale-105 active:scale-[0.98]"
                >
                  Find courses
                </Link>
              </div>
            </div>
          </article>

          <div className="rounded-3xl bg-white/[0.06] p-5 ring-1 ring-white/10 sm:p-6">
            <h3 className="sr-only">Choose a destination</h3>
            <ul className="flex flex-wrap gap-2">
              {destinations.map((d) => {
                const isActive = d.slug === selected;
                return (
                  <li key={d.slug}>
                    <button
                      type="button"
                      onClick={() => choose(d.slug)}
                      aria-pressed={isActive}
                      className={`focus-ring rounded-full px-4 py-2 text-sm font-bold transition ${
                        isActive
                          ? "text-white"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                      style={isActive ? { backgroundColor: d.accent } : undefined}
                    >
                      {d.name}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="mt-8">
              <p className="text-[0.65rem] font-extrabold tracking-[0.18em] text-gold-400 uppercase">
                What we check with you
              </p>
              <div className="mt-4 grid gap-3">
                {reviewAreas.map((item) => (
                  <div key={item.label} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                    <div className="flex items-start gap-3">
                      <item.icon className="mt-0.5 shrink-0 text-gold-400" size={20} aria-hidden />
                      <div>
                        <h4 className="font-display font-bold text-white">{item.label}</h4>
                        <p className="mt-1 text-sm text-navy-100/75">{item.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-5 text-navy-950">
              <div className="flex items-center gap-2">
                <MapPin className="text-gold-500" size={18} aria-hidden />
                <h4 className="font-display font-bold">Student cities</h4>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {active.cities.map((city) => (
                  <span
                    key={city}
                    className="rounded-full bg-navy-50 px-3 py-1.5 text-xs font-extrabold text-navy-800"
                  >
                    {city}
                  </span>
                ))}
              </div>
              <ul className="mt-5 space-y-2">
                {active.perks.slice(0, 3).map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-navy-900/75">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0"
                      style={{ color: active.accent }}
                      aria-hidden
                    />
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
