import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/home/hero";
import { JourneyPlanner } from "@/components/home/journey-planner";
import { FlightMap } from "@/components/home/flight-map";
import { DestinationDesk } from "@/components/home/destination-desk";
import {
  TrustStrip,
  JourneyTimeline,
  TeamAdvice,
  BoardingCta,
} from "@/components/home/sections";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { Stats } from "@/components/stats";
import { Testimonials } from "@/components/testimonials";
import { services } from "@/lib/services";
import { getCmsDestinations } from "@/lib/cms-destinations";

export default async function HomePage() {
  const destinations = await getCmsDestinations();
  return (
    <>
      <Hero destinations={destinations} />
      <DestinationDesk destinations={destinations} />
      <JourneyPlanner destinations={destinations} />
      <TrustStrip />
      <FlightMap destinations={destinations} />

      {/* Services preview — full list lives on /services */}
      <section className="bg-white py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
              What we do
            </p>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display mt-3 text-3xl font-extrabold text-navy-950 md:text-4xl">
                Everything handled, end to end
              </h2>
              <Link href="/services" className="focus-ring font-semibold text-navy-700 hover:underline">
                All services →
              </Link>
            </div>
          </Reveal>
          <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s) => (
              <StaggerItem key={s.slug}>
                <div className="group h-full rounded-2xl bg-ivory p-6 ring-1 ring-navy-100 transition-all hover:-translate-y-1 hover:bg-navy-700 hover:shadow-xl">
                  <s.icon className="text-gold-500" size={28} aria-hidden />
                  <h3 className="font-display mt-4 font-bold text-navy-900 group-hover:text-white">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-navy-900/70 group-hover:text-navy-100">
                    {s.blurb}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <JourneyTimeline />

      {/* Stats — counts derived from data, no invented figures */}
      <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <Reveal>
          <Stats destinations={destinations} />
        </Reveal>
      </section>

      {/* Student stories */}
      <section className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
              Visa success stories
            </p>
            <h2 className="font-display mt-3 text-3xl font-extrabold text-navy-950 md:text-4xl">
              Students we&apos;ve walked with
            </h2>
          </Reveal>
          <div className="mt-10">
            <Testimonials />
          </div>
        </div>
      </section>

      <TeamAdvice />

      {/* Ongoing support */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:py-24 lg:grid-cols-2">
        <Reveal>
          <Image
            src="/images/team-counselling-office.png"
            alt="Ready to Study counsellors advising a student in the office"
            width={702}
            height={561}
            sizes="(min-width: 1024px) 46vw, 92vw"
            className="rounded-[2rem] object-cover shadow-2xl shadow-navy-900/15"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
            After enrolment
          </p>
          <h2 className="font-display mt-3 text-3xl font-extrabold text-navy-950 md:text-4xl">
            Support continues after your offer
          </h2>
          <p className="mt-4 text-navy-900/75">
            Our Sydney office supports students through enrolment, accommodation
            questions, first-semester planning, and help if your course or provider
            needs to change.
          </p>
          <Link
            href="/services"
            className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full bg-navy-700 px-6 py-3 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105 active:scale-[0.98]"
          >
            See how we help <ArrowRight size={18} />
          </Link>
        </Reveal>
      </section>

      <BoardingCta destinations={destinations} />
    </>
  );
}
