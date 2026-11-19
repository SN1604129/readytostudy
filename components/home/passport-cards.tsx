"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { destinations } from "@/lib/destinations";

/**
 * Destination guide cards.
 *
 * All information is always visible — nothing is hidden behind hover, so the
 * cards work identically on touch, by keyboard and for screen readers. Motion
 * is limited to a 1–2 degree lift on hover/focus.
 */
export function PassportCards() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
      <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
        Destination guides
      </p>
      <h2 className="font-display mt-3 max-w-xl text-3xl font-extrabold text-navy-950 md:text-4xl">
        Every destination, one guide
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((d) => (
          <motion.article
            key={d.slug}
            whileHover={reduce ? undefined : { y: -6, rotate: -0.6 }}
            whileFocus={reduce ? undefined : { y: -6 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-ivory shadow-lg shadow-navy-900/5 ring-1 ring-navy-100"
          >
            {/* destination guide strip */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 text-white" style={{ backgroundColor: d.accent }}>
              <div>
                <p className="text-[0.6rem] font-bold tracking-[0.2em] uppercase opacity-80">
                  Destination
                </p>
                <p className="font-display text-xl font-extrabold">{d.name}</p>
              </div>
              <span className="font-display rounded-lg bg-white/20 px-2.5 py-1 text-sm font-extrabold">
                {d.short}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <p className="text-sm text-navy-900/75">{d.tagline}</p>

              {d.badge && (
                <p className="mt-4 inline-block self-start rounded-full bg-badge-red px-3 py-1 text-[0.65rem] font-extrabold tracking-wide text-white uppercase">
                  {d.badge}
                </p>
              )}

              <ul className="mt-5 space-y-1.5 text-sm text-navy-900/80">
                {d.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <CheckCircle2 size={15} className="mt-0.5 shrink-0" style={{ color: d.accent }} aria-hidden />
                    {perk}
                  </li>
                ))}
              </ul>

              <p className="mt-5 font-mono text-[0.7rem] tracking-wider text-navy-900/40">
                {d.coords.city.toUpperCase()} · {Math.abs(d.coords.lat).toFixed(2)}°
                {d.coords.lat >= 0 ? "N" : "S"}
              </p>

              <Link
                href={`/destinations/${d.slug}`}
                className="focus-ring mt-auto inline-flex items-center gap-1.5 pt-6 font-bold text-navy-700 hover:underline"
              >
                Explore destination
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
