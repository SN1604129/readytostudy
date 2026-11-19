import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/motion";
import { ContactForm } from "@/components/contact-form";
import { getCmsDestinations } from "@/lib/cms-destinations";
import { site } from "@/lib/site";
import Link from "next/link";
import { getCurrentUser, safeUser } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Book a free consultation with Ready to Study — offices in Rockdale, Sydney and Sobhanbag, Dhaka.",
};

export default async function ContactPage() {
  const destinations = await getCmsDestinations();
  const user = await getCurrentUser();

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6 md:pt-16">
      <Reveal>
        <p className="font-script text-2xl text-navy-600">Free consultation</p>
        <h1 className="font-display max-w-2xl text-4xl font-extrabold text-navy-950 md:text-5xl">
          Talk to us — Sydney or Dhaka
        </h1>
      </Reveal>
      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <div className="space-y-6">
            {site.offices.map((o) => (
              <div key={o.label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
                <h2 className="font-display flex items-center gap-2 font-bold text-navy-900">
                  <MapPin size={18} className="text-gold-500" /> {o.label}
                </h2>
                <p className="mt-2 text-sm text-navy-900/75">{o.address}</p>
                <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="focus-ring mt-3 inline-flex items-center gap-2 text-sm font-bold text-navy-700">
                  <Phone size={15} /> {o.phone}
                </a>
              </div>
            ))}
            <div className="rounded-2xl bg-navy-700 p-6 text-white shadow-lg shadow-navy-700/25">
              <h2 className="font-display flex items-center gap-2 font-bold">
                <Mail size={18} className="text-gold-400" /> Email
              </h2>
              <a href={`mailto:${site.email}`} className="focus-ring mt-2 inline-block font-semibold text-navy-100 hover:text-white">
                {site.email}
              </a>
              <p className="mt-3 text-sm text-navy-100/80">
                We reply in English or Bangla — whichever you prefer.
              </p>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          {user ? <ContactForm destinations={destinations} user={safeUser(user)} /> : <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-navy-100">
            <h2 className="font-display text-2xl font-extrabold text-navy-950">Log in to send an enquiry</h2>
            <p className="mt-3 text-navy-900/70">Create a free account to contact a counsellor and keep your enquiry and its progress in your private history.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/login?next=%2Fcontact" className="focus-ring rounded-full bg-navy-700 px-6 py-3 font-bold text-white">Log in</Link>
              <Link href="/signup?next=%2Fcontact" className="focus-ring rounded-full bg-gold-500 px-6 py-3 font-bold text-navy-950">Create an account</Link>
            </div>
          </div>}
        </Reveal>
      </div>
    </section>
  );
}
