import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Phone } from "lucide-react";
import { CtaBanner } from "@/components/cta-banner";
import { Reveal } from "@/components/motion";
import { getPublicEvents, type CmsEvent } from "@/lib/cms-events";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Events",
  description: "Ready to Study student events, webinars and special offers. Book a free consultation with our team.",
};

function EventCard({ event, eager = false }: { event: CmsEvent; eager?: boolean }) {
  const image = event.images[0];
  return (
    <Reveal>
      <article id={event.slug} className={`grid overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy-900/10 ring-1 ring-navy-100 ${image ? "lg:grid-cols-2" : ""}`}>
        {image && (
          <a href={image.src} target="_blank" rel="noopener noreferrer" aria-label={`View the full ${event.name} image (opens in a new tab)`} className="focus-ring block self-center">
            <Image src={image.src} alt={image.alt} width={1200} height={1500} unoptimized loading={eager ? "eager" : "lazy"} sizes="(max-width: 1023px) 100vw, 576px" className="h-auto max-h-[760px] w-full object-contain" />
          </a>
        )}
        <div className="flex flex-col justify-center p-6 sm:p-9 lg:p-10">
          <span className="w-fit rounded-full bg-gold-100 px-4 py-1.5 text-xs font-extrabold tracking-wide text-navy-900 uppercase">
            {event.status === "offer" ? "Special offer" : event.status === "past" ? "Past event" : "Upcoming event"} · {event.kind}
          </span>
          <h3 className="font-display mt-5 text-3xl font-extrabold text-navy-950 sm:text-4xl">{event.name}</h3>
          <p className="mt-4 whitespace-pre-line leading-relaxed text-navy-900/75">{event.summary}</p>
          <dl className="mt-5 grid gap-3 text-sm text-navy-900/75">
            {event.date && <div><dt className="inline-flex items-center gap-2 font-bold"><CalendarDays size={16} /> Date & time</dt><dd className="mt-1">{event.date}</dd></div>}
            {event.location && <div><dt className="inline-flex items-center gap-2 font-bold"><MapPin size={16} /> Location</dt><dd className="mt-1">{event.location}</dd></div>}
          </dl>
          {!!event.partners?.length && <p className="mt-5 text-sm text-navy-900/60">With {event.partners.join(" · ")}</p>}
          {event.disclaimer && <p className="mt-5 rounded-xl bg-ice px-4 py-3 text-sm leading-relaxed text-navy-900/75">{event.disclaimer}</p>}
          {event.status === "offer" && <div className="mt-6 border-t border-navy-100 pt-5">
            <p className="font-bold text-navy-950">Free consultation</p>
            <div className="mt-3 flex flex-wrap gap-4">{site.phones.map(number => <a key={number} href={`tel:${number.replace(/\s/g, "")}`} className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-navy-700"><Phone size={16} />{number}</a>)}</div>
          </div>}
          <Link href="/contact" className="focus-ring mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-navy-700 px-6 py-3.5 text-sm font-bold text-white">
            {event.status === "offer" ? "Ask about this offer" : event.status === "past" ? "Ask about upcoming events" : "Enquire about this event"} <ArrowRight size={18} />
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export default async function EventsPage() {
  const events = await getPublicEvents();
  const groups = [
    { status: "offer", title: "Student offers" },
    { status: "upcoming", title: "Upcoming events" },
    { status: "past", title: "Past events & industry presence" },
  ];
  return <>
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-10 sm:px-6 md:pt-16">
      <p className="font-script text-2xl text-navy-600">Events & offers</p>
      <h1 className="font-display mt-2 max-w-3xl text-4xl font-extrabold text-navy-950 md:text-5xl">Student events and special offers</h1>
      <p className="mt-4 max-w-2xl text-lg text-navy-900/75">Meet the Ready to Study team through practical sessions on courses, applications and study abroad planning.</p>
    </section>
    {groups.map(group => {
      const items = events.filter(event => event.status === group.status);
      if (!items.length && group.status !== "upcoming") return null;
      return <section key={group.status} className="mx-auto max-w-6xl px-4 pb-14 sm:px-6" aria-label={group.title}>
        <h2 className="font-display mb-6 text-2xl font-extrabold text-navy-950">{group.title}</h2>
        <div className="space-y-8">{items.map(event => <EventCard key={event.slug} event={event} eager={event === events[0]} />)}</div>
        {!items.length && <p className="rounded-2xl bg-white p-6 text-navy-900/70 ring-1 ring-navy-100">No upcoming events are scheduled yet. <Link href="/contact" className="font-bold text-navy-700 underline">Contact us</Link> to hear about the next session.</p>}
      </section>;
    })}
    <CtaBanner />
  </>;
}
