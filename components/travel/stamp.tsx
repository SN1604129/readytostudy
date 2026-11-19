"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * A restrained rubber-stamp mark. Used to acknowledge a completed action
 * (destination explored, checklist started, journey step done).
 *
 * Never used to imply an admission, scholarship or visa outcome.
 */
export function Stamp({
  label,
  sublabel,
  tone = "gold",
  size = 128,
  animate = true,
}: {
  label: string;
  sublabel?: string;
  tone?: "gold" | "navy" | "sky";
  size?: number;
  animate?: boolean;
}) {
  const reduce = useReducedMotion();
  const colors = {
    gold: "var(--color-gold-500)",
    navy: "var(--color-navy-700)",
    sky: "var(--color-sky-500)",
  } as const;
  const ink = colors[tone];

  const shouldAnimate = animate && !reduce;

  return (
    <motion.div
      className="inline-block select-none"
      style={{ width: size, height: size }}
      initial={shouldAnimate ? { scale: 1.6, opacity: 0, rotate: -18 } : false}
      whileInView={shouldAnimate ? { scale: 1, opacity: 0.92, rotate: -8 } : undefined}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 120" width={size} height={size} fill="none">
        <circle cx="60" cy="60" r="52" stroke={ink} strokeWidth="3" strokeDasharray="1 6" strokeLinecap="round" opacity="0.75" />
        <circle cx="60" cy="60" r="44" stroke={ink} strokeWidth="4" opacity="0.9" />
        <text
          x="60"
          y={sublabel ? 57 : 66}
          textAnchor="middle"
          fontSize="15"
          fontWeight="800"
          fill={ink}
          letterSpacing="1.5"
          style={{ textTransform: "uppercase" }}
        >
          {label}
        </text>
        {sublabel && (
          <text x="60" y="76" textAnchor="middle" fontSize="10" fontWeight="600" fill={ink} letterSpacing="1" opacity="0.85">
            {sublabel}
          </text>
        )}
      </svg>
    </motion.div>
  );
}
