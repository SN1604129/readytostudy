import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LogoLockup } from "./animated-logo";
import { nav, site } from "@/lib/site";
import { destinations } from "@/lib/destinations";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-100">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1.4fr]">
        <div>
          <LogoLockup light size={150} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-100/80">
            Helping Bangladeshi students study abroad — course selection, admissions,
            scholarships and visas, at zero cost to students.
          </p>
        </div>
        <div>
          <h3 className="font-display mb-3 text-sm font-bold tracking-wide text-white">Explore</h3>
          <ul className="space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="focus-ring hover:text-gold-400">{n.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display mb-3 text-sm font-bold tracking-wide text-white">Destinations</h3>
          <ul className="space-y-2 text-sm">
            {destinations.map((d) => (
              <li key={d.slug}>
                <Link href={`/destinations/${d.slug}`} className="focus-ring hover:text-gold-400">
                  Study in {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-4 text-sm">
          <h3 className="font-display text-sm font-bold tracking-wide text-white">Contact</h3>
          {site.offices.map((o) => (
            <p key={o.label} className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold-400" />
              <span><strong className="text-white">{o.label}:</strong> {o.address}</span>
            </p>
          ))}
          <p className="flex gap-2">
            <Phone size={16} className="mt-0.5 shrink-0 text-gold-400" />
            <span>{site.phones.join(" · ")}</span>
          </p>
          <p className="flex gap-2">
            <Mail size={16} className="mt-0.5 shrink-0 text-gold-400" />
            <a href={`mailto:${site.email}`} className="focus-ring hover:text-gold-400">{site.email}</a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 pb-24 text-center text-xs text-navy-100/60 sm:pb-5">
        © {new Date().getFullYear()} {site.name} {site.tagline}. All rights reserved.
      </div>
    </footer>
  );
}
