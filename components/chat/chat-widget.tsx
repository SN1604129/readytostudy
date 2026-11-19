"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X } from "lucide-react";
import { useAdvisor } from "./advisor-provider";
import { AdvisorPanel } from "./advisor-panel";

export function ChatWidget() {
  const { open, setOpen } = useAdvisor();
  const pathname = usePathname();
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const escape = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); button.current?.focus(); } };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open, setOpen]);
  if (pathname === "/course-finder") return null;
  return <>
    <button ref={button} type="button" onClick={() => setOpen(!open)} aria-label={open ? "Close course advisor" : "Open course advisor"} aria-expanded={open} className="focus-ring fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy-700 text-white shadow-xl shadow-navy-700/30">{open ? <X /> : <MessageCircle />}</button>
    {open && <div ref={panel} tabIndex={-1} role="dialog" aria-label="Course advisor" className="fixed right-3 bottom-22 z-50 max-h-[calc(100dvh-7rem)] w-[min(27rem,calc(100vw-1.5rem))] overflow-y-auto rounded-3xl shadow-2xl outline-none sm:right-5"><button type="button" onClick={() => { setOpen(false); button.current?.focus(); }} aria-label="Close advisor panel" className="focus-ring absolute top-4 right-3 z-10 rounded-full p-2 text-white hover:bg-white/10"><X size={16} /></button><AdvisorPanel compact /></div>}
  </>;
}
