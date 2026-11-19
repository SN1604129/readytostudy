import type { ContentMeta } from "./content-meta";

/**
 * Intake periods per destination.
 *
 * ⚠️ ALL ENTRIES ARE CURRENTLY UNVERIFIED. Ready to Study has not supplied
 * confirmed intake months for its partner institutions, and intake dates vary
 * by institution and course. Nothing here is displayed until `verified` is set
 * to true, and no countdown is ever rendered without a confirmed deadline.
 *
 * Never invent an application deadline.
 */
export type Intake = ContentMeta & {
  destination: string;
  /** e.g. ["February", "July"] — institution-dependent. */
  months: string[];
  note?: string;
};

export const intakes: Intake[] = [
  { destination: "australia", months: [], verified: false, lastUpdated: "—" },
  { destination: "new-zealand", months: [], verified: false, lastUpdated: "—" },
  { destination: "united-kingdom", months: [], verified: false, lastUpdated: "—" },
  { destination: "china", months: [], verified: false, lastUpdated: "—" },
  { destination: "malaysia", months: [], verified: false, lastUpdated: "—" },
];

export function intakeFor(destination: string) {
  const found = intakes.find((i) => i.destination === destination);
  return found && found.verified && found.months.length > 0 ? found : null;
}
