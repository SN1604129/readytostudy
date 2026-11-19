import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CtaBanner } from "@/components/cta-banner";
import { site } from "@/lib/site";
import { HandHeart, ShieldCheck, Globe2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description:
    "Ready to Study is a Sydney-based education consultancy with a Dhaka office, guiding Bangladeshi students abroad at zero cost.",
};

const values = [
  { icon: ShieldCheck, title: "Accurate information", text: "Advice grounded in current visa rules and real institution requirements — never guesswork." },
  { icon: HandHeart, title: "Free for students", text: "Students never pay us. Partner institutions do. Your best-fit option always comes first." },
  { icon: Globe2, title: "Both sides of the journey", text: "A team in Dhaka that knows where you're starting, and a team in Sydney that knows where you're going." },
];

export default function AboutPage() {
  return (
    <>
      {/* Founder hero — real banner photo */}
      <section className="relative overflow-hidden bg-navy-950 pt-12 md:pt-16">
        <div className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <Reveal>
            <p className="font-script text-2xl text-gold-400">Our story</p>
            <h1 className="font-display max-w-3xl text-4xl font-extrabold text-white md:text-5xl">
              Built by people who made this journey themselves
            </h1>
            <p className="mt-4 max-w-xl text-lg text-navy-100/85">
              A team across Sydney and Dhaka guiding students from first question to
              first semester — at no cost to the student.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <figure className="mt-10 overflow-hidden rounded-3xl ring-1 ring-white/15">
              <Image
                src="/images/founder-mashfi-banner.png"
                alt={`${site.founder.name}, founder of Ready to Study — "${site.founder.quote}"`}
                width={2659}
                height={984}
                priority
                className="w-full object-cover"
              />
            </figure>
            <blockquote className="mx-auto mt-8 max-w-3xl text-center">
              <p className="font-display text-2xl leading-snug font-semibold text-white md:text-3xl">
                “{site.founder.quote}”
              </p>
              <footer className="font-script mt-3 text-2xl text-gold-400">— {site.founder.name}, Founder</footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold text-navy-950 md:text-4xl">What we stand for</h2>
        </Reveal>
        <Stagger className="mt-10 grid gap-5 md:grid-cols-3">
          {values.map((v) => (
            <StaggerItem key={v.title}>
              <div className="h-full rounded-2xl bg-white p-7 shadow-sm ring-1 ring-navy-100">
                <v.icon size={30} className="text-gold-500" aria-hidden />
                <h3 className="font-display mt-4 text-lg font-bold text-navy-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy-900/70">{v.text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Credibility — real photos */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="font-script text-2xl text-navy-600">In the industry, on the ground</p>
            <h2 className="font-display max-w-2xl text-3xl font-extrabold text-navy-950 md:text-4xl">
              Where you&apos;ll find our team
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <Reveal>
              <figure className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-navy-100">
                <Image
                  src="/images/team-aiec-2025-canberra.jpg"
                  alt="Ready to Study representatives at the AIEC 2025 conference in Canberra"
                  width={1080}
                  height={1351}
                  className="aspect-[4/3] w-full object-cover object-top"
                />
                <figcaption className="bg-ice px-5 py-4 text-sm text-navy-900/80">
                  <strong className="text-navy-900">AIEC 2025, Canberra</strong> — representing RTS at the
                  Australian International Education Conference, alongside universities and industry partners.
                </figcaption>
              </figure>
            </Reveal>
            <Reveal delay={0.1}>
              <figure className="overflow-hidden rounded-3xl shadow-lg ring-1 ring-navy-100">
                <Image
                  src="/images/event-buckle-up-award.jpg"
                  alt="Ready to Study presenting at the Buckle Up 3.0 career-navigation seminar with Army IBA, Savar"
                  width={2048}
                  height={1367}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="bg-ice px-5 py-4 text-sm text-navy-900/80">
                  <strong className="text-navy-900">Buckle Up 3.0, Dhaka</strong> — partnering with Army IBA
                  (Savar) on career-navigation seminars for Bangladeshi students.
                </figcaption>
              </figure>
            </Reveal>
          </div>
          <Reveal delay={0.15}>
            <figure className="mt-6 overflow-hidden rounded-3xl shadow-lg ring-1 ring-navy-100">
              <Image
                src="/images/event-buckle-up-group.jpg"
                alt="Students and the Ready to Study team at the Buckle Up 3.0 seminar"
                width={2048}
                height={1367}
                className="max-h-[420px] w-full object-cover"
              />
              <figcaption className="bg-ice px-5 py-4 text-sm text-navy-900/80">
                Every seat filled — the students we run these sessions for.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
