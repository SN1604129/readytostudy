"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, MessageSquare } from "lucide-react";
import { destinations as defaults, type Destination } from "@/lib/destinations";

export function Hero({ destinations = defaults }: { destinations?: Destination[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const current = destinations[index] ?? destinations[0];

  useEffect(() => {
    if (reduce || destinations.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((value) => (value + 1) % destinations.length);
    }, 3200);
    return () => window.clearInterval(id);
  }, [reduce, destinations.length]);

  return (
    <section className="relative min-h-[680px] overflow-hidden bg-navy-950 pt-16 pb-20 md:min-h-[720px] md:pt-24 md:pb-24">
      <Image
        src="/images/home-graduate-hero.png"
        alt="A happy international student celebrating her graduation on a Sydney university campus"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[68%_center] sm:object-[64%_center] lg:object-center"
      />
      <div className="absolute inset-0 bg-navy-950/45 lg:bg-transparent" aria-hidden />
      <div
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,19,38,0.98)_0%,rgba(5,19,38,0.94)_35%,rgba(5,19,38,0.48)_58%,rgba(5,19,38,0.08)_100%)] max-lg:bg-[linear-gradient(90deg,rgba(5,19,38,0.96)_0%,rgba(5,19,38,0.82)_62%,rgba(5,19,38,0.42)_100%)]"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-navy-950/80 to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-bold tracking-[0.28em] text-gold-400 uppercase">
            Study abroad education counsellors
          </p>
          <h1 className="font-display mt-4 text-4xl leading-[1.04] font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
            Find the right course, university and visa pathway
          </h1>

          <p className="mt-5 flex flex-wrap items-baseline gap-x-3 text-xl text-navy-100/90">
            <span>Build a study plan for</span>
            <span className="relative inline-flex min-w-[9ch] items-baseline">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={current.slug}
                  initial={reduce ? false : { y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: -14, opacity: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="font-display text-2xl font-extrabold text-gold-400"
                >
                  {current.name}
                </motion.span>
              </AnimatePresence>
            </span>
          </p>

          <p className="mt-4 max-w-xl text-lg leading-relaxed text-navy-100/90">
            Course selection, admissions, scholarships and visa preparation, guided by
            counsellors in Sydney and Dhaka, in Bangla or English, at{" "}
            <strong className="text-white">no cost to you</strong>.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/course-finder"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 font-bold text-navy-950 shadow-xl shadow-gold-500/25 transition-transform hover:scale-105 active:scale-[0.98]"
            >
              Find My Course <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="focus-ring inline-flex items-center gap-2 rounded-full border-2 border-white/50 bg-navy-950/20 px-7 py-3.5 font-bold text-white backdrop-blur-sm transition hover:bg-white/10 active:scale-[0.98]"
            >
              <MessageSquare size={18} /> Talk to an Adviser
            </Link>
          </div>

          <p className="mt-7 font-mono text-xs tracking-wider text-white/60">
            {current.name.toUpperCase()} · {current.cities.length} STUDENT CITIES · FREE COUNSELLING
          </p>
        </div>
      </div>

      <div className="relative mx-auto mt-14 grid max-w-4xl gap-3 px-6 text-sm font-semibold text-white/80 sm:grid-cols-3">
        {["Course shortlist", "Admission documents", "Student visa plan"].map((item) => (
          <div key={item} className="rounded-2xl bg-navy-950/35 px-4 py-3 ring-1 ring-white/20 backdrop-blur-md">
            {item}
          </div>
        ))}
      </div>

      <div className="relative mt-8 flex justify-center">
        <a
          href="#plan"
          className="focus-ring flex flex-col items-center gap-1 text-xs font-semibold tracking-wider text-white/60 uppercase transition hover:text-white/90"
        >
          Start your study plan
          <motion.span
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown size={18} />
          </motion.span>
        </a>
      </div>
    </section>
  );
}
