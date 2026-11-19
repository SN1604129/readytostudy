"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useId } from "react";

/**
 * A curved flight route that draws itself, with a plane riding the path.
 * The route renders fully drawn for reduced-motion users and whenever
 * JavaScript is unavailable — the animation is progressive enhancement only.
 */
export function RouteLine({
  d = "M12 92 C 140 92, 190 26, 320 40 S 520 78, 588 20",
  className = "",
  duration = 1.8,
  showPlane = true,
  strokeWidth = 2.5,
}: {
  d?: string;
  className?: string;
  duration?: number;
  showPlane?: boolean;
  strokeWidth?: number;
}) {
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, "");

  return (
    <svg viewBox="0 0 600 110" fill="none" className={className} aria-hidden="true">
      {/* faint full route always visible */}
      <path d={d} stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="2 9" strokeLinecap="round" opacity="0.28" />

      {/* animated overlay */}
      <motion.path
        id={`route-${id}`}
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray="2 9"
        strokeLinecap="round"
        initial={reduce ? undefined : { pathLength: 0 }}
        whileInView={reduce ? undefined : { pathLength: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration, ease: "easeInOut" }}
      />

      {showPlane &&
        (reduce ? (
          <g transform="translate(588 20)">
            <path d="M0 0 l-15 3 6 5 -3 9 12 -17 Z" fill="currentColor" />
          </g>
        ) : (
          <motion.g
            initial={{ offsetDistance: "0%" }}
            whileInView={{ offsetDistance: "100%" }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration, ease: "easeInOut" }}
            style={{
              offsetPath: `path("${d}")`,
              offsetRotate: "auto",
            }}
          >
            <path d="M0 0 l-15 3 6 5 -3 9 12 -17 Z" fill="currentColor" />
          </motion.g>
        ))}
    </svg>
  );
}
