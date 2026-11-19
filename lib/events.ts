import type { ContentMeta } from "./content-meta";

/**
 * Events and industry presence.
 *
 * Photos are real and already in the project. Dates and details that were not
 * supplied are left undefined rather than guessed — the UI omits any field it
 * does not have. Never show "seats remaining" or other fake live figures.
 */
export type RtsEvent = ContentMeta & {
  slug: string;
  name: string;
  kind: "conference" | "seminar" | "webinar" | "promotion";
  /** Human-readable date. Leave undefined if not confirmed. */
  date?: string;
  location?: string;
  summary: string;
  images: { src: string; alt: string }[];
  partners?: string[];
};

export const cashbackPromotion: RtsEvent & {
  contacts: { label: string; number: string; href: string }[];
} = {
  slug: "ielts-pte-cashback",
  name: "100% cashback on IELTS & PTE score",
  kind: "promotion",
  summary:
    "Book a free consultation with Ready to Study to ask about the IELTS and PTE cashback offer and plan your next steps towards studying abroad.",
  images: [
    {
      src: "/images/event-ielts-pte-cashback.png",
      alt: "Ready to Study promotion: 100% cashback on IELTS and PTE score. Terms and conditions apply. Free consultation: +61 426 243 477 or +8801920515157.",
    },
  ],
  contacts: [
    { label: "Australia", number: "+61 426 243 477", href: "tel:+61426243477" },
    { label: "Bangladesh", number: "+880 1920 515157", href: "tel:+8801920515157" },
  ],
  disclaimer:
    "Terms and conditions apply. Contact the team to confirm eligibility, required scores and the full cashback terms.",
  verified: true,
  lastUpdated: "October 2026",
  sourceLabel: "Ready to Study promotional poster",
  // The supplied poster does not specify dates or eligibility thresholds.
};

export const demoEvent: RtsEvent = {
  slug: "guiding-your-path-global-education",
  name: "Webinar with Mashfi Rahman",
  kind: "webinar",
  date: "29 August 2026, 8 PM-9 PM",
  location: "Online webinar",
  summary:
    "A student webinar on choosing the right study destination, planning applications and preparing for a global education journey.",
  images: [
    {
      src: "/images/Mashfi event.jpeg",
      alt: "Webinar with Mashfi Rahman event poster for guiding students toward global education",
    },
  ],
  partners: ["BGCTUB IT Club", "BGC Trust University Bangladesh"],
  verified: true,
  lastUpdated: "September 2026",
  sourceLabel: "Ready to Study",
};

export const events: RtsEvent[] = [
  {
    slug: "aiec-2025-canberra",
    name: "AIEC 2025, Canberra",
    kind: "conference",
    location: "Canberra, Australia",
    summary:
      "Ready to Study attended the Australian International Education Conference, meeting universities and industry partners.",
    images: [
      {
        src: "/images/team-aiec-2025-canberra.jpg",
        alt: "Ready to Study representatives at the AIEC 2025 conference in Canberra",
      },
    ],
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Ready to Study",
    // CONTENT GAP: exact conference dates not supplied.
  },
  {
    slug: "buckle-up-3",
    name: "Buckle Up 3.0",
    kind: "seminar",
    location: "Army IBA, Savar, Bangladesh",
    summary:
      "A career-navigation seminar for Bangladeshi students, run with Army IBA Savar.",
    images: [
      {
        src: "/images/event-buckle-up-award.jpg",
        alt: "Ready to Study receiving a crest at the Buckle Up 3.0 seminar at Army IBA, Savar",
      },
      {
        src: "/images/event-buckle-up-group.jpg",
        alt: "Students and the Ready to Study team at the Buckle Up 3.0 seminar",
      },
    ],
    partners: ["Army IBA, Savar"],
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Ready to Study",
    // CONTENT GAP: event date and attendance figures not supplied.
  },
];

export const upcomingEvents: RtsEvent[] = [
  // CONTENT GAP: no upcoming events supplied. Add entries here — the events
  // section renders an honest "no events scheduled" state while this is empty.
];
