import type { ReactNode } from "react";

/**
 * Scroll-reveal wrappers.
 *
 * These are plain server components — no client JS is required for the
 * content to be visible. They only add `data-reveal` markers; the tiny
 * inline script in app/layout.tsx animates them if it can run. If it
 * can't, CSS leaves everything visible. See app/globals.css.
 */

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${Math.round(delay * 1000)}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-reveal-group="" className={className}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-reveal="" className={className}>
      {children}
    </div>
  );
}
