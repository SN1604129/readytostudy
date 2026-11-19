/**
 * CONTENT GAP REGISTRY
 *
 * Every piece of information the site needs but does not yet have, in one
 * place. Nothing in this list is invented, estimated or filled with a
 * placeholder that could be mistaken for fact — the UI renders an honest
 * empty state instead.
 *
 * When Ready to Study supplies an item: update the relevant data module,
 * set `verified: true` with a `lastUpdated` date, and remove the entry here.
 */

export type GapSeverity = "blocking" | "important" | "nice-to-have";

export type ContentGap = {
  id: string;
  area: string;
  what: string;
  module: string;
  severity: GapSeverity;
  /** What the site currently does instead. */
  fallback: string;
};

export const contentGaps: ContentGap[] = [
  {
    id: "bd-phone",
    area: "Contact",
    what: "Three different Bangladesh phone numbers appear across Ready to Study material (+880 1920 515157, +880 1920 515757, +880 14758 25689). Confirm the correct one.",
    module: "lib/offices.ts",
    severity: "blocking",
    fallback: "Publishing the poster/brief number, +880 1920 515157.",
  },
  {
    id: "testimonial-name",
    area: "Testimonials",
    what: "The supplied poster credits Alok Biswas with Bachelor of Cyber Security at Torrens University; the live site credits Abdullah Jahin with the same course and university. Confirm whether these are two students or one record is wrong.",
    module: "lib/testimonials.ts",
    severity: "blocking",
    fallback: "Using the poster (Alok Biswas), since the poster is the supplied asset.",
  },
  {
    id: "real-stats",
    area: "Credibility",
    what: "No verified figures for students guided, counsellors, institution partnerships or years operating. (The current live site shows unfilled '0+' counters.)",
    module: "components/stats.tsx",
    severity: "important",
    fallback: "Stats show only counts derived from site data — destinations, services, offices — plus the zero-cost promise. No student numbers claimed.",
  },
  {
    id: "success-claims",
    area: "Credibility",
    what: "Facebook advertises a '100% Visa Success Rate' and the live site carries a '95% success rate' line. Neither is substantiated. Unverifiable success-rate claims carry real consumer-law exposure in Australia.",
    module: "—",
    severity: "important",
    fallback: "Neither claim appears anywhere on the new site.",
  },
  {
    id: "team-photos",
    area: "Team",
    what: "Individual headshot files for the eight team members. (Only low-resolution website thumbnails are available.)",
    module: "lib/team.ts",
    severity: "important",
    fallback: "Team cards render initials avatars until files are added to /public/images/team/.",
  },
  {
    id: "budget-figures",
    area: "Budget tool",
    what: "Living-cost and tuition ranges for New Zealand, the United Kingdom, China and Malaysia. (Australia is sourced from the Department of Home Affairs benchmark.)",
    module: "lib/journey-content.ts",
    severity: "important",
    fallback: "Budget calculator supports Australia only; other destinations show a 'figures being confirmed' state.",
  },
  {
    id: "intakes",
    area: "Intakes",
    what: "Confirmed intake months per destination and partner institution.",
    module: "lib/intakes.ts",
    severity: "important",
    fallback: "No intake information or countdown is displayed.",
  },
  {
    id: "course-list",
    area: "Course Finder",
    what: "Verification of the seeded course/university pairings against the real partner list.",
    module: "data/courses.json via /admin",
    severity: "important",
    fallback: "Admins can manage the course list; results remain guidance until the list is verified.",
  },
  {
    id: "scholarship-detail",
    area: "Scholarships",
    what: "Institution-specific scholarship names, amounts and eligibility criteria.",
    module: "lib/scholarships.ts",
    severity: "nice-to-have",
    fallback: "Only the categories already published on Ready to Study posters are shown.",
  },
  {
    id: "event-dates",
    area: "Events",
    what: "Dates for AIEC 2025 Canberra and Buckle Up 3.0, plus any upcoming events.",
    module: "lib/events.ts",
    severity: "nice-to-have",
    fallback: "Events show name, location and photos only. Upcoming events section stays empty.",
  },
  {
    id: "about-copy",
    area: "About",
    what: "Approved company story copy. Only the founder quote is genuinely supplied.",
    module: "app/about/page.tsx",
    severity: "nice-to-have",
    fallback: "Draft copy written for review, clearly flagged in the README.",
  },
  {
    id: "partner-logos",
    area: "Credibility",
    what: "Logos and names of partner universities and any accreditation memberships.",
    module: "—",
    severity: "nice-to-have",
    fallback: "No partner or accreditation logos are shown.",
  },
  {
    id: "form-delivery",
    area: "Forms",
    what: "Email or CRM provider for enquiry delivery (e.g. Resend, SendGrid).",
    module: "CONTACT_WEBHOOK_URL",
    severity: "important",
    fallback: "Enquiries are saved in the admin inbox; optional webhook forwarding is not configured.",
  },
  {
    id: "bangla-copy",
    area: "Language",
    what: "Human-translated Bangla copy.",
    module: "lib/i18n",
    severity: "nice-to-have",
    fallback: "Language architecture built; English remains the complete fallback.",
  },
];

export const gapsBySeverity = (s: GapSeverity) => contentGaps.filter((g) => g.severity === s);
