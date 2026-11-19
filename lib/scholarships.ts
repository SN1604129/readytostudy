import type { ContentMeta } from "./content-meta";

/**
 * Scholarship CATEGORIES that Ready to Study helps students explore.
 *
 * Hard rule: no invented amounts, universities or eligibility criteria.
 * The only figures here are ones already published on Ready to Study's own
 * destination posters. Everything else is described as a category to discuss
 * with a counsellor.
 *
 * Never use the words "guaranteed", "you will receive" or "approved" about a
 * scholarship a student has not actually been offered.
 */
export type Scholarship = ContentMeta & {
  id: string;
  destination: string;
  title: string;
  summary: string;
  /** Figure only where Ready to Study already publishes one. */
  headline?: string;
};

export const scholarships: Scholarship[] = [
  {
    id: "nz-partner-scholarship",
    destination: "new-zealand",
    title: "Partner scholarship",
    headline: "15–35%",
    summary:
      "Ready to Study's New Zealand partners offer a 15–35% scholarship. The exact percentage depends on the institution, course and your academic profile.",
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Ready to Study — Study New Zealand campaign",
  },
  {
    id: "china-full-funded",
    destination: "china",
    title: "Fully funded scholarship",
    headline: "Full funding",
    summary:
      "Fully funded scholarship options are available for China. Eligibility and coverage vary by university and programme — a counsellor will confirm what you may qualify for.",
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Ready to Study — Study China campaign",
  },
  {
    id: "uk-free-service",
    destination: "united-kingdom",
    title: "No service charge",
    summary:
      "Ready to Study's UK service is free of charge to students. This is a service promise, not a tuition scholarship.",
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Ready to Study — Study UK campaign",
  },
  {
    id: "malaysia-free-service",
    destination: "malaysia",
    title: "No service charge",
    summary:
      "Ready to Study's Malaysia service is free of charge to students, with credit-transfer pathways available.",
    verified: true,
    lastUpdated: "August 2026",
    sourceLabel: "Ready to Study — Study Malaysia campaign",
  },
  // CONTENT GAP: institution-specific scholarships (names, amounts, criteria)
  // have not been supplied. Add entries here once Ready to Study confirms them.
];

export function scholarshipsFor(destination: string) {
  return scholarships.filter((s) => s.destination === destination && s.active !== false && s.verified);
}
