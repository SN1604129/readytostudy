import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, ShieldCheck, Wallet } from "lucide-react";
import { journeyStages } from "@/lib/journey-content";
import { services } from "@/lib/services";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { offices } from "@/lib/offices";
import { team, initials } from "@/lib/team";
import { CountUp } from "@/components/count-up";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { BoardingPass } from "@/components/travel/boarding-pass";

/* ------------------------------------------------------------ trust strip */

export function TrustStrip() {
  return (
    <section className="border-y border-navy-100 bg-white py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 md:grid-cols-3">
        <Reveal className="flex gap-4">
          <Wallet className="mt-0.5 shrink-0 text-gold-500" size={26} aria-hidden />
          <div>
            <h3 className="font-display font-bold text-navy-950">No service charge</h3>
            <p className="mt-1 text-sm text-navy-900/70">
              Counselling, applications and visa support are free for students — we are
              paid by partner institutions.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="flex gap-4">
          <MapPin className="mt-0.5 shrink-0 text-gold-500" size={26} aria-hidden />
          <div>
            <h3 className="font-display font-bold text-navy-950">Offices in both countries</h3>
            <p className="mt-1 text-sm text-navy-900/70">
              {offices.map((o) => o.city).join(" and ")} — sit down with us in person, or
              talk online in Bangla or English.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.16} className="flex gap-4">
          <ShieldCheck className="mt-0.5 shrink-0 text-gold-500" size={26} aria-hidden />
          <div>
            <h3 className="font-display font-bold text-navy-950">Straight answers</h3>
            <p className="mt-1 text-sm text-navy-900/70">
              Institutions decide admissions and governments decide visas. We prepare your
              application properly and tell you where you actually stand.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- study timeline */

export function JourneyTimeline() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-24">
      <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
        Study pathway
      </p>
      <h2 className="font-display mt-3 max-w-xl text-3xl font-extrabold text-navy-950 md:text-4xl">
        From first question to first semester
      </h2>

      <ol className="relative mt-12 grid gap-8 md:grid-cols-3">
        {/* timeline rail behind the stages on wide screens */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-7 z-0 hidden border-t-2 border-dashed border-navy-200 md:block"
        />
        {journeyStages.map((stage, i) => {
          const service = services.find((s) => s.slug === stage.serviceSlug);
          return (
            <li key={stage.id} className="relative">
              <div className="flex items-center gap-3">
                <span className="font-display relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-700 text-lg font-extrabold text-white shadow-lg shadow-navy-700/25">
                  <CountUp to={i + 1} duration={700} />
                </span>
                <h3 className="font-display relative z-10 rounded-lg bg-ice px-2 py-1 text-lg font-bold text-navy-950">
                  {stage.title}
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-navy-900/70">{stage.blurb}</p>
              {service && (
                <Link
                  href="/services"
                  className="focus-ring mt-3 inline-flex items-center gap-1 text-sm font-bold text-navy-700 hover:underline"
                >
                  {service.title} <ArrowRight size={14} />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------ team advice */

export function TeamAdvice() {
  const founder = team[0];

  return (
    <section className="bg-ivory py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
          Ask our team
        </p>
        <h2 className="font-display mt-3 max-w-xl text-3xl font-extrabold text-navy-950 md:text-4xl">
          Advice from the people who&apos;ll guide you
        </h2>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
          <Reveal>
            <figure className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-navy-900/10 ring-1 ring-navy-100">
              <Image
                src="/images/mashfi-at-office.png"
                alt="Mashfi Rahman counselling students at the Ready to Study office"
                width={702}
                height={415}
                sizes="(min-width: 1024px) 48vw, 92vw"
                className="aspect-[702/415] w-full object-cover"
              />
              <figcaption className="px-5 py-4 text-sm text-navy-900/70">
                In-person counselling at the Ready to Study office.
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.1} className="flex items-center">
            <figure className="border-l-4 border-gold-500 pl-6">
              <blockquote className="font-display text-2xl leading-snug font-semibold text-navy-950 md:text-3xl">
                “{founder.quote}”
              </blockquote>
              <figcaption className="mt-4 text-sm text-navy-900/65">
                <span className="font-bold text-navy-900">{founder.name}</span>, {founder.role}
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <Stagger className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {team.slice(1).map((m) => (
            <StaggerItem key={m.slug}>
              <figure className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
                <figcaption className="flex items-center gap-3">
                  {/* CONTENT GAP: headshot files not supplied — initials avatar */}
                  <span className="font-display flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-700 text-sm font-extrabold text-white">
                    {initials(m.name)}
                  </span>
                  <span>
                    <span className="font-display block font-bold text-navy-950">{m.name}</span>
                    <span className="block text-sm text-navy-900/65">{m.role}</span>
                  </span>
                </figcaption>
                <blockquote className="mt-4 text-sm leading-relaxed text-navy-900/80">
                  “{m.quote}”
                </blockquote>
              </figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- study plan CTA */

export function BoardingCta({ destinations = defaults }: { destinations?: Destination[] }) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6 md:py-24">
      <Reveal>
        <BoardingPass
          from="STUDENT PROFILE"
          to="COUNSELLOR"
          title="Start My Study Plan"
          subtitle="Free consultation — Sydney, Dhaka or online"
          status="Ready to plan"
          fields={[
            { label: "Study destinations", value: `${destinations.length} available` },
            { label: "Service fee", value: "No charge" },
            { label: "Languages", value: "Bangla / English" },
          ]}
          footer={
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-6 py-3 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105 active:scale-[0.98]"
              >
                Request a consultation <ArrowRight size={18} />
              </Link>
              <Link
                href="/course-finder"
                className="focus-ring font-bold text-navy-700 hover:underline"
              >
                Or find my course first
              </Link>
            </div>
          }
        >
          <p className="text-sm text-navy-900/70">
            This starts a free consultation request. A counsellor will contact you
            to understand your profile and recommend the next step.
          </p>
        </BoardingPass>
      </Reveal>
    </section>
  );
}
