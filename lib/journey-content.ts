/**
 * Journey stages — the six steps of the Ready to Study process.
 * Mapped onto real services from lib/services.ts.
 */
export type JourneyStage = {
  id: string;
  title: string;
  blurb: string;
  serviceSlug?: string;
};

export const journeyStages: JourneyStage[] = [
  {
    id: "consultation",
    title: "Free consultation",
    blurb:
      "Talk through your grades, budget and goals with a counsellor in Sydney or Dhaka — in English or Bangla.",
    serviceSlug: "counselling",
  },
  {
    id: "course-matching",
    title: "Course matching",
    blurb:
      "We shortlist courses and institutions that fit your profile, and map the scholarships you may qualify for.",
    serviceSlug: "course-university-selection",
  },
  {
    id: "application",
    title: "Application and offer",
    blurb:
      "We prepare and submit your applications, then guide you through offer letters and conditions.",
    serviceSlug: "admission-support",
  },
  {
    id: "visa",
    title: "Visa preparation",
    blurb:
      "Document checklists and financial evidence guidance, prepared carefully before lodgement.",
    serviceSlug: "visa-processing",
  },
  {
    id: "pre-departure",
    title: "Pre-departure support",
    blurb:
      "Accommodation, arrival planning and what to expect in your first weeks.",
    serviceSlug: "accommodation-support",
  },
  {
    id: "arrival",
    title: "Arrival support",
    blurb:
      "Our Sydney office is here after you land — settling in, and help if your plans change.",
    serviceSlug: "institute-migration",
  },
];

/**
 * Budget assumptions.
 *
 * These are EDITABLE ESTIMATES, not permanent facts. Official financial
 * requirements change — review the `lastUpdated` date before relying on them.
 * Set `verified: false` where Ready to Study has not yet confirmed figures;
 * the UI hides unverified rows rather than showing a guess.
 */
export type BudgetAssumption = {
  destination: string;
  currency: string;
  /** Official/indicative annual living costs, if a citable figure exists. */
  livingPerYear?: number;
  livingSource?: string;
  /** Indicative annual tuition range. */
  tuitionMin?: number;
  tuitionMax?: number;
  verified: boolean;
  lastUpdated: string;
  note?: string;
};

export const budgetAssumptions: BudgetAssumption[] = [
  {
    destination: "australia",
    currency: "AUD",
    livingPerYear: 29710,
    livingSource: "Department of Home Affairs student visa financial capacity benchmark",
    tuitionMin: 7000,
    tuitionMax: 50000,
    verified: true,
    lastUpdated: "August 2026",
    note: "Overseas Student Health Cover is additional (roughly AUD 590–806/year for a single student) and is not included in the living-cost benchmark.",
  },
  // CONTENT GAP: figures for the destinations below have not been verified.
  // Add livingPerYear / tuition ranges with a source, then set verified: true.
  { destination: "new-zealand", currency: "NZD", verified: false, lastUpdated: "—" },
  { destination: "united-kingdom", currency: "GBP", verified: false, lastUpdated: "—" },
  { destination: "china", currency: "CNY", verified: false, lastUpdated: "—" },
  { destination: "malaysia", currency: "MYR", verified: false, lastUpdated: "—" },
  { destination: "canada", currency: "CAD", verified: false, lastUpdated: "—" },
  { destination: "italy", currency: "EUR", verified: false, lastUpdated: "—" },
];

export function getBudgetAssumption(destination: string) {
  return budgetAssumptions.find((b) => b.destination === destination);
}
