import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CtaBanner } from "@/components/cta-banner";
import { getCmsDestinations } from "@/lib/cms-destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Study in Australia, New Zealand, the United Kingdom, China or Malaysia with Ready to Study — each with its own scholarships and perks.",
};

export default async function DestinationsPage() {
  const destinations = await getCmsDestinations();

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 md:pt-16">
        <Reveal>
          <p className="font-script text-2xl text-navy-600">Pick your path</p>
          <h1 className="font-display max-w-2xl text-4xl font-extrabold text-navy-950 md:text-5xl">
            Every destination, each with a real offer
          </h1>
        </Reveal>
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <Stagger className="grid gap-6 md:grid-cols-2">
          {destinations.map((d) => (
            <StaggerItem key={d.slug}>
              <Link
                href={`/destinations/${d.slug}`}
                className="focus-ring group relative block h-full overflow-hidden rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-100 transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-navy-900/10"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1.5"
                  style={{ backgroundColor: d.accent }}
                />
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-2xl font-extrabold text-navy-950 group-hover:text-navy-700">
                      Study in {d.name}
                    </h2>
                    <p className="mt-1 text-navy-900/70">{d.tagline}</p>
                  </div>
                  <span
                    className="font-display inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                    style={{ backgroundColor: d.accent }}
                  >
                    {d.short}
                  </span>
                </div>
                {d.badge && (
                  <p className="mt-4 inline-block rounded-full bg-badge-red px-3.5 py-1 text-xs font-extrabold tracking-wide text-white uppercase">
                    {d.badge}
                  </p>
                )}
                <ul className="mt-5 grid gap-1.5 text-sm text-navy-900/75 sm:grid-cols-2">
                  {d.perks.slice(0, 4).map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-1.5 font-bold text-navy-700">
                  Explore {d.name} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
      <CtaBanner />
    </>
  );
}
