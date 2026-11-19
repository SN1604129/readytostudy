import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CtaBanner } from "@/components/cta-banner";
import { services } from "@/lib/services";

export const metadata: Metadata = {
  title: "Services",
  description:
    "All 11 Ready to Study services: course & university selection, scholarships, admissions, counselling, visas, migration support and more — free for students.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 md:pt-16">
        <Reveal>
          <p className="font-script text-2xl text-navy-600">What we do</p>
          <h1 className="font-display max-w-2xl text-4xl font-extrabold text-navy-950 md:text-5xl">
            Everything handled, end to end.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-900/75">
            Every service below is included at no cost to students — from the first
            counselling session to visas for the family who&apos;ll visit your graduation.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <StaggerItem key={s.slug}>
              <article className="group h-full rounded-2xl bg-white p-7 shadow-sm ring-1 ring-navy-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10">
                <div className="flex items-center justify-between">
                  <s.icon size={30} className="text-navy-700 transition-colors group-hover:text-gold-500" aria-hidden />
                  <span className="font-display text-xs font-bold tracking-widest text-navy-100">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h2 className="font-display mt-4 text-lg font-bold text-navy-900">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/70">{s.blurb}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <Image
              src="/images/team-counselling-office.png"
              alt="Illustrative: a counselling session reviewing university brochures"
              width={1402}
              height={1122}
              className="rounded-[2rem] object-cover shadow-xl shadow-navy-900/10"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-script text-2xl text-navy-600">How it works</p>
            <h2 className="font-display text-3xl font-extrabold text-navy-950 md:text-4xl">
              Start with a conversation
            </h2>
            <p className="mt-4 text-navy-900/75">
              Tell us your grades, budget and goals. We&apos;ll shortlist courses and
              destinations, map the scholarships you qualify for, and give you a
              document checklist — all in your first free session.
            </p>
            <Link
              href="/contact"
              className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full bg-navy-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105"
            >
              Book the free session <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
