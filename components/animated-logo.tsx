"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The real Ready to Study logo (Opera House sails + open book).
 * The image itself always renders — the motion wrapper only adds a
 * subtle lift/settle on load and a gentle nudge on hover, so the mark
 * is never hidden if JS doesn't run.
 */
export function AnimatedMark({ size = 150, light = false }: { size?: number; light?: boolean }) {
  const reduce = useReducedMotion();
  const src = light ? "/images/logo-mark-white.png" : "/images/logo-mark.png";

  return (
    <motion.span
      className="inline-block"
      whileHover={reduce ? undefined : { y: -2, scale: 1.03 }}
      transition={{ duration: 0.6, ease: [0.21, 0.65, 0.36, 1] }}
    >
      <Image
        src={src}
        alt="Ready to Study Education Services"
        width={1029}
        height={689}
        priority
        style={{ width: size, height: "auto" }}
      />
    </motion.span>
  );
}

export function LogoLockup({ light = false, size = 150 }: { light?: boolean; size?: number }) {
  return (
    <Link href="/" className="focus-ring inline-flex items-center" aria-label="Ready to Study — home">
      <AnimatedMark light={light} size={size} />
    </Link>
  );
}
