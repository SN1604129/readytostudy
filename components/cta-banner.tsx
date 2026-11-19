import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./motion";

export function CtaBanner() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/images/abstract-gold-navy.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        aria-hidden
      />
      <div className="absolute inset-0 bg-navy-950/55" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 md:py-28">
        <Reveal>
          <p className="font-script text-2xl text-gold-400">Your journey starts here</p>
          <h2 className="font-display mx-auto mt-2 max-w-2xl text-3xl font-extrabold text-white md:text-5xl">
            One free consultation. A clear plan to study abroad.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-navy-100/90">
            Talk to a counsellor in Sydney or Dhaka — in English or Bangla. No service
            charge, no obligation.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 font-bold text-navy-950 shadow-xl shadow-gold-500/30 transition-transform hover:scale-105"
            >
              Book a free consultation <ArrowRight size={18} />
            </Link>
            <Link
              href="/course-finder"
              className="focus-ring inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-7 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              Try the Course Finder
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
