"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Dashed flight-path motif from the RTS destination posters.
 *  Fully drawn by default; only the draw-in is animated. */
export function FlightPath({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <svg viewBox="0 0 600 120" fill="none" className={className} aria-hidden="true">
      <motion.path
        d="M10 100 C 150 100, 180 30, 320 42 S 540 80, 585 24"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeDasharray="2 10"
        strokeLinecap="round"
        initial={reduce ? undefined : { pathLength: 0 }}
        whileInView={reduce ? undefined : { pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <path d="M585 24 l-14 2 6 5 -3 8 11 -15 Z" fill="currentColor" />
    </svg>
  );
}
