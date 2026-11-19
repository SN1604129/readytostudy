"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { testimonials } from "@/lib/testimonials";

/** One slider, three real students. Photos are the students' actual
 *  visa-success posters — never swap for stock or generated images. */
export function Testimonials() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const reduce = useReducedMotion();
  const t = testimonials[index];

  const go = (next: number) => {
    setDir(next > index || (index === testimonials.length - 1 && next === 0) ? 1 : -1);
    setIndex((next + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.figure
          key={t.name}
          initial={reduce ? false : { opacity: 0, x: 40 * dir }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -40 * dir }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid items-center gap-8 md:grid-cols-[minmax(0,380px)_1fr]"
        >
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy-900/10 ring-1 ring-navy-100">
            <Image
              src={t.image}
              alt={`${t.name} — visa success, ${t.institution}`}
              fill
              sizes="(min-width: 768px) 380px, 90vw"
              className="object-contain p-2"
            />
          </div>
          <div>
            <Quote className="mb-4 text-gold-500" size={36} aria-hidden />
            <blockquote className="font-display text-2xl leading-snug font-semibold text-navy-900 md:text-3xl">
              “{t.quote}”
            </blockquote>
            <figcaption className="mt-5">
              <p className="font-bold text-navy-700">{t.name}</p>
              <p className="text-sm text-navy-900/70">
                {t.course} · {t.institution}
              </p>
            </figcaption>
          </div>
        </motion.figure>
      </AnimatePresence>

      <div className="mt-8 flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(index - 1)}
          aria-label="Previous story"
          className="focus-ring rounded-full border border-navy-100 bg-white p-2.5 text-navy-700 shadow-sm transition hover:bg-navy-50"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          type="button"
          onClick={() => go(index + 1)}
          aria-label="Next story"
          className="focus-ring rounded-full border border-navy-100 bg-white p-2.5 text-navy-700 shadow-sm transition hover:bg-navy-50"
        >
          <ChevronRight size={20} />
        </button>
        <div className="ml-2 flex gap-2" role="tablist" aria-label="Student stories">
          {testimonials.map((s, i) => (
            <button
              key={s.name}
              role="tab"
              aria-selected={i === index}
              aria-label={s.name}
              onClick={() => go(i)}
              className={`focus-ring h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-navy-700" : "w-2.5 bg-navy-100 hover:bg-navy-600/40"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
