"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BookOpenCheck, Calculator, ClipboardCheck, Gauge, Map, X } from "lucide-react";
import { destinations as fallbackDestinations, type Destination } from "@/lib/destinations";
import { readinessSteps, useJourney } from "@/lib/journey";

const tools = [
  { href: "/budget", label: "Budget", bn: "বাজেট", icon: Calculator },
  { href: "/compare", label: "Compare", bn: "তুলনা", icon: Map },
  { href: "/checklist", label: "Checklist", bn: "চেকলিস্ট", icon: ClipboardCheck },
  { href: "/readiness", label: "Readiness", bn: "প্রস্তুতি", icon: Gauge },
];

export function VirtualStudentPassport({ destinations = fallbackDestinations }: { destinations?: Destination[] }) {
  const [open, setOpen] = useState(false);
  const { journey } = useJourney();
  const reduce = useReducedMotion();
  const destination = destinations.find((d) => d.slug === journey.destination);
  const completed = readinessSteps.filter((step) => step.done(journey)).length;

  return (
    <>
      <motion.button
        type="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close saved study plan" : "Open saved study plan"}
        className="focus-ring fixed bottom-5 left-5 z-50 inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-3 font-extrabold text-navy-950 shadow-xl shadow-gold-500/30"
        whileHover={reduce ? undefined : { y: -2 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
      >
        <BookOpenCheck size={18} /> Study plan
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.aside
            role="dialog"
            aria-label="Saved Study Plan"
            initial={reduce ? false : { opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -24 }}
            transition={{ duration: 0.22 }}
            className="fixed bottom-20 left-5 z-50 w-[min(24rem,calc(100vw-2.5rem))] overflow-hidden rounded-3xl bg-white shadow-2xl shadow-navy-900/25 ring-1 ring-navy-100"
          >
            <header className="flex items-center justify-between bg-navy-950 px-5 py-4 text-white">
              <div>
                <p className="font-display font-extrabold">Saved Study Plan</p>
                <p className="text-xs text-navy-100/75">আপনার স্টাডি প্ল্যান</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close study plan" className="focus-ring rounded-lg p-1">
                <X size={20} />
              </button>
            </header>

            <div className="p-5">
              <div className="rounded-2xl bg-ice p-4">
                <p className="text-xs font-bold text-gold-500 uppercase">Current study plan</p>
                <p className="font-display mt-1 text-xl font-extrabold text-navy-950">
                  {destination ? `Study in ${destination.name}` : "No destination saved"}
                </p>
                <p className="mt-2 text-sm text-navy-900/65">
                  {completed}/{readinessSteps.length} readiness steps complete · {journey.savedCourses.length} saved courses
                </p>
              </div>

              {journey.budgetEstimate && (
                <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-navy-900 ring-1 ring-navy-100">
                  Budget estimate: {journey.budgetEstimate.currency}{" "}
                  {journey.budgetEstimate.annualTotal.toLocaleString()}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                {tools.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setOpen(false)}
                    className="focus-ring rounded-2xl bg-navy-50 p-4 text-navy-900 transition hover:bg-navy-100"
                  >
                    <tool.icon size={20} className="text-navy-700" aria-hidden />
                    <span className="mt-2 block font-bold">{tool.label}</span>
                    <span className="text-xs text-navy-900/55">{tool.bn}</span>
                  </Link>
                ))}
              </div>

              <Link
                href={destination ? `/course-finder?destination=${destination.slug}` : "/course-finder"}
                onClick={() => setOpen(false)}
                className="focus-ring mt-5 flex items-center gap-2 rounded-full bg-navy-700 px-5 py-3 font-bold text-white"
              >
                <BookOpenCheck size={18} /> Continue course finder
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
