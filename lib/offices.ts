import type { ContentMeta } from "./content-meta";

/**
 * Ready to Study offices.
 *
 * ⚠️ CONTENT CONFLICT — Bangladesh phone number.
 * Three different numbers appear across Ready to Study material:
 *   • +880 1920 515157  (most destination posters, and the build brief)
 *   • +880 1920 515757  (the "Study Australia" poster)
 *   • +880 14758 25689  (readytostudy.com.au site footer)
 * We publish the poster/brief number below. Ready to Study must confirm which
 * is correct, then update `phones` here — it is the single source of truth.
 *
 * Enquiry inbox confirmed by the owner: contact@readytostudy.com.au.
 * Transactional messages are sent from info@readytostudy.com.au.
 */
export type Office = ContentMeta & {
  id: "sydney" | "bangladesh";
  label: string;
  city: string;
  addressLines: string[];
  phones: string[];
  timeZone: string;
  mapQuery: string;
};

export const offices: Office[] = [
  {
    id: "sydney",
    label: "Sydney office",
    city: "Sydney",
    addressLines: ["8 Walz St, Rockdale", "Sydney NSW 2217", "Australia"],
    phones: ["+61 426 243 477"],
    timeZone: "Australia/Sydney",
    mapQuery: "8 Walz St, Rockdale NSW 2217, Australia",
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Supplied by Ready to Study",
  },
  {
    id: "bangladesh",
    label: "Bangladesh office",
    city: "Dhaka",
    addressLines: ["House 9, Road 13", "New Sobhanbag Rd, 1209", "Dhaka, Bangladesh"],
    phones: ["+880 1920 515157"],
    timeZone: "Asia/Dhaka",
    mapQuery: "New Sobhanbag Road, Dhanmondi, Dhaka 1209, Bangladesh",
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Supplied by Ready to Study",
    disclaimer: "Phone number pending confirmation — see note in lib/offices.ts.",
  },
];

export const contactEmail = "contact@readytostudy.com.au";
export const websiteDomain = "www.readytostudy.org";
