import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { CtaBanner } from "@/components/cta-banner";
import { getCmsDestination, getCmsDestinations } from "@/lib/cms-destinations";

// Next.js App Router: params is a Promise — always await it.
type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return (await getCmsDestinations()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getCmsDestination(slug);
  if (!d) return { title: "Destination not found" };
  return {
    title: `Study in ${d.name}`,
    description: `${d.tagline} ${d.intro}`,
  };
}

export default async function DestinationPage({ params }: { params: Params }) {
  const { slug } = await params;
  const d = await getCmsDestination(slug);
  if (!d) notFound();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pt-14 pb-14 md:pt-20" style={{ backgroundColor: "#0e1f4b" }}>
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-25 blur-3xl"
          style={{ backgroundColor: d.accent }}
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="font-script text-3xl text-gold-400">Study</p>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-white uppercase md:text-7xl">
              {d.name}
            </h1>
            <p className="mt-3 max-w-xl text-lg text-navy-100/90">{d.tagline}</p>
            {d.badge && (
              <p className="mt-5 inline-block rounded-full bg-badge-red px-5 py-2 text-sm font-extrabold tracking-wide text-white uppercase shadow-lg shadow-badge-red/40 ring-2 ring-white/50">
                {d.badge}
              </p>
            )}
          </Reveal>
        </div>
      </section>

      {/* What we offer */}
      <section className="mx-auto grid max-w-6xl items-start gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold text-navy-950">What we offer?</h2>
            <p className="mt-3 max-w-xl text-navy-900/75">{d.intro}</p>
          </Reveal>
          <Stagger className="mt-8 space-y-3">
            {d.perks.map((p) => (
              <StaggerItem key={p} className="flex items-center gap-3 rounded-xl bg-white px-5 py-3.5 shadow-sm ring-1 ring-navy-100">
                <CheckCircle2 size={20} style={{ color: d.accent }} aria-hidden />
                <span className="font-medium text-navy-900">{p}</span>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {d.highlights.map((h) => (
                <span
                  key={h}
                  className="rounded-full px-4 py-1.5 text-sm font-semibold text-white"
                  style={{ backgroundColor: d.accent }}
                >
                  {h}
                </span>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm text-navy-900/70">
              <MapPin size={16} className="text-gold-500" />
              Popular cities: {d.cities.join(", ")}
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          {d.image && (
            <figure className="mx-auto w-full max-w-sm">
              <Image
                src={d.image}
                unoptimized={d.image.startsWith("https://")}
                alt={`Study in ${d.name} destination image for Ready to Study`}
                width={d.imageSize?.width ?? 1080}
                height={d.imageSize?.height ?? 1350}
                sizes="(max-width: 639px) calc(100vw - 32px), 384px"
                className="h-auto w-full rounded-3xl object-contain shadow-2xl shadow-navy-900/15 ring-1 ring-navy-100"
              />
              <figcaption className="mt-3 text-center text-xs text-navy-900/55">
                {d.imageFit === "contain" ? <a href={d.image} target="_blank" rel="noopener noreferrer" className="focus-ring font-semibold text-navy-700 underline">View full {d.name} poster</a> : <>Study in {d.name} with Ready to Study</>}
              </figcaption>
            </figure>
          )}
        </Reveal>
      </section>

      {/* Next steps */}
      <section className="bg-white py-16">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
          <Reveal>
            <h2 className="font-display text-2xl font-extrabold text-navy-950 md:text-3xl">
              See which {d.name} courses fit you
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/course-finder"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-6 py-3 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105"
              >
                Course Finder <ArrowRight size={18} />
              </Link>
              <Link
                href="/contact"
                className="focus-ring inline-flex items-center gap-2 rounded-full border-2 border-navy-700/25 px-6 py-3 font-bold text-navy-700 transition hover:border-navy-700/50"
              >
                Talk to a counsellor
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
