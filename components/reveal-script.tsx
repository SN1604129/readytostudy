"use client";

import { useEffect } from "react";

/**
 * Scroll reveal controller.
 *
 * Runs after React hydration so it never changes the server-rendered HTML
 * before React compares it with the client tree. Content remains visible by
 * default; this only adds progressive reveal animation when JS is available.
 */

export function RevealScript() {
  useEffect(() => {
    try {
      if (!("IntersectionObserver" in window)) return;

      const root = document.documentElement;
      root.classList.add("reveal-ready");

      const show = (el: Element) => el.classList.add("is-visible");
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              show(entry.target);
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
      );

      const scan = () => {
        const groups = document.querySelectorAll("[data-reveal-group]");
        groups.forEach((group) => {
          const kids = group.querySelectorAll(":scope > [data-reveal]");
          kids.forEach((kid, index) => {
            (kid as HTMLElement).style.setProperty("--reveal-delay", `${index * 80}ms`);
          });
        });
        document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => io.observe(el));
      };

      scan();
      const mo = new MutationObserver(scan);
      mo.observe(document.body, { childList: true, subtree: true });

      const fallback = window.setTimeout(() => {
        document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach(show);
      }, 2500);

      return () => {
        window.clearTimeout(fallback);
        mo.disconnect();
        io.disconnect();
        root.classList.remove("reveal-ready");
      };
    } catch {
      document.documentElement.classList.remove("reveal-ready");
    }
  }, []);

  return null;
}
