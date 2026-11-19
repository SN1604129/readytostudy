"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, CheckCircle2, MapPin, Save } from "lucide-react";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { useJourney } from "@/lib/journey";

export function DestinationDesk({ destinations = defaults }: { destinations?: Destination[] }) {
  const [selected, setSelected] = useState(destinations[0].slug);
  const { journey, update, addStamp } = useJourney();
  const reduce = useReducedMotion();

  const active = destinations.find((d) => d.slug === selected) ?? destinations[0];
  const saved = journey.destination === active.slug;
  const showFullImage = Boolean(active.image) && active.imageFit === "contain";

  const saveDestination = () => {
    update({ destination: active.slug });
    addStamp(active.slug);
  };

  return (
    <section className="bg-white py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-[0.7rem] font-bold text-gold-500 uppercase">
              Destination desk
            </p>
            <h2 className="font-display mt-3 max-w-2xl text-3xl font-extrabold text-navy-950 md:text-4xl">
              Choose the country that feels like your next chapter
            </h2>
          </div>
          <Link href="/destinations" className="focus-ring font-semibold text-navy-700 hover:underline">
            Compare all destinations →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {destinations.map((d) => {
              const isActive = d.slug === active.slug;
              return (
                <button
                  key={d.slug}
                  type="button"
                  onClick={() => setSelected(d.slug)}
                  aria-pressed={isActive}
                  className={`focus-ring group flex min-h-24 items-center gap-4 rounded-2xl border bg-ice p-3 text-left transition ${
                    isActive
                      ? "border-navy-700 shadow-lg shadow-navy-900/10"
                      : "border-navy-100 hover:border-navy-200 hover:bg-white"
                  }`}
                >
                  <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                    {d.image && (
                      <Image
                        src={d.image}
                        unoptimized={d.image.startsWith("https://")}
                        alt=""
                        fill
                        sizes="64px"
                        className={d.imageFit === "contain" ? "object-contain" : "object-cover transition duration-300 group-hover:scale-105"}
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="font-display block font-extrabold text-navy-950">
                      {d.name}
                    </span>
                    <span className="mt-1 block text-sm text-navy-900/65">{d.tagline}</span>
                  </span>
                  <span
                    className="ml-auto hidden h-3 w-3 shrink-0 rounded-full sm:block"
                    style={{ backgroundColor: d.accent }}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-[2rem] bg-navy-950 text-white shadow-2xl shadow-navy-900/20">
            <div className="grid min-h-[34rem] lg:grid-cols-[0.95fr_1.05fr]">
              <div
                className="relative min-h-80 overflow-hidden bg-navy-900"
                style={showFullImage ? { aspectRatio: `${active.imageSize?.width ?? 1080} / ${active.imageSize?.height ?? 1350}` } : undefined}
              >
                {!active.image && <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-br from-navy-700 to-navy-950 p-8"><span className="font-display text-8xl font-extrabold text-white/15">{active.short}</span><p className="font-display mt-4 text-3xl font-extrabold text-white">{active.name}</p><p className="mt-2 text-sm text-gold-400">{active.badge || "Study with Ready to Study"}</p></div>}
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
                      alt={`Study in ${active.name}`}
                      fill
                      sizes="(min-width: 1024px) 38vw, 92vw"
                      className={showFullImage ? "object-contain" : "object-cover"}
                      priority={active.slug === "australia"}
                    />
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-sm font-extrabold text-gold-400">
                      {active.short} study profile
                    </p>
                    <h3 className="font-display mt-2 text-3xl font-extrabold">
                      Study in {active.name}
                    </h3>
                    <p className="mt-3 text-navy-100/80">{active.intro}</p>
                  </div>
                  <span
                    className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold"
                    style={{ backgroundColor: active.accent }}
                  >
                    {active.short}
                  </span>
                </div>

                {active.badge && (
                  <p className="mt-5 inline-flex self-start rounded-full bg-badge-red px-4 py-1.5 text-xs font-extrabold text-white uppercase">
                    {active.badge}
                  </p>
                )}

                <ul className="mt-6 grid gap-2">
                  {active.perks.slice(0, 4).map((perk) => (
                    <li key={perk} className="flex items-start gap-2.5 text-sm text-navy-100/90">
                      <CheckCircle2
                        size={17}
                        className="mt-0.5 shrink-0"
                        style={{ color: active.accent }}
                        aria-hidden
                      />
                      {perk}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 grid gap-3 text-sm text-navy-100/80 sm:grid-cols-2">
                  <p className="flex items-center gap-2">
                    <MapPin size={16} className="text-gold-400" aria-hidden />
                    {active.coords.city}
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 size={16} className="text-gold-400" aria-hidden />
                    Popular student city
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
                  <button
                    type="button"
                    onClick={saveDestination}
                    className="focus-ring inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-extrabold text-navy-950 shadow-lg shadow-gold-500/25 transition-transform hover:scale-105 active:scale-[0.98]"
                  >
                    <Save size={17} /> {saved ? "Destination saved" : "Save destination"}
                  </button>
                  <Link
                    href={`/course-finder?destination=${active.slug}`}
                    className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-extrabold text-navy-900 transition-transform hover:scale-105 active:scale-[0.98]"
                  >
                    Find courses <ArrowRight size={17} />
                  </Link>
                  <Link
                    href={`/destinations/${active.slug}`}
                    className="focus-ring font-bold text-gold-400 hover:underline"
                  >
                    Details
                  </Link>
                </div>

                <p className="mt-4 text-xs text-navy-100/45" aria-live="polite">
                  {saved
                    ? `${active.name} is now part of your journey.`
                    : "No destination saved yet."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
