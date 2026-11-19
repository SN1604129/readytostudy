"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { LogoLockup } from "./animated-logo";
import { nav, site } from "@/lib/site";
import { useJourney } from "@/lib/journey";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { user } = useJourney();
  const navigation = user ? nav.map(item => item.href === "/login" ? { href: user.role === "admin" ? "/admin" : "/student", label: "My account" } : item) : nav;

  const close = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-ice/90 px-3 py-3 backdrop-blur supports-[backdrop-filter]:bg-ice/75">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-lg shadow-navy-900/10 ring-1 ring-navy-100/70">
        <div className="flex h-[4.75rem] items-center justify-between gap-4 px-4 sm:px-5">
          <LogoLockup size={108} />

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Main">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`focus-ring relative rounded-full px-2.5 py-2 text-sm font-semibold transition-colors lg:px-4 ${
                    active ? "text-navy-700" : "text-navy-900/70 hover:text-navy-700"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId={reduce ? undefined : "nav-pill"}
                      className="absolute inset-0 rounded-full bg-navy-50"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
            <Link
              href="/contact"
              className="focus-ring ml-1 rounded-full bg-navy-700 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-[1.03] hover:bg-navy-600 lg:ml-3 lg:px-5"
            >
              Free consultation
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="focus-ring rounded-lg p-2 text-navy-800 xl:hidden"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav
              aria-label="Mobile"
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-navy-100 bg-white xl:hidden"
            >
              <div className="space-y-1 px-4 py-4">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className="focus-ring block rounded-xl px-4 py-3 font-semibold text-navy-800 hover:bg-navy-50"
                  >
                    {item.label}
                  </Link>
                ))}
                <a
                  href={`tel:${site.phones[0].replace(/\s/g, "")}`}
                  className="mt-2 flex items-center gap-2 rounded-xl bg-navy-700 px-4 py-3 font-bold text-white"
                >
                  <Phone size={18} /> {site.phones[0]}
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
