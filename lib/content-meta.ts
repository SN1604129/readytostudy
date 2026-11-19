/**
 * Shared metadata contract for every content module.
 *
 * Rule for this codebase: any fact that can go out of date (fees, living
 * costs, intake dates, visa requirements, scholarship amounts) must carry
 * this metadata. The UI hides `verified: false` entries rather than
 * displaying a guess, so a missing figure never becomes an invented one.
 */
export type ContentMeta = {
  /** Has Ready to Study confirmed this content? Unverified content is hidden. */
  verified: boolean;
  /** Human-readable review date, e.g. "August 2026". Use "—" when unverified. */
  lastUpdated: string;
  /** Where the figure came from, shown to users next to the date. */
  sourceLabel?: string;
  /** Set false to retire an entry without deleting it. */
  active?: boolean;
  /** Optional extra caveat rendered with the entry. */
  disclaimer?: string;
};

export const defaultMeta: ContentMeta = {
  verified: false,
  lastUpdated: "—",
  active: true,
};

/** Only content that is both active and verified should ever be displayed. */
export function isPublishable<T extends ContentMeta>(item: T) {
  return item.active !== false && item.verified;
}

export function publishable<T extends ContentMeta>(items: T[]) {
  return items.filter(isPublishable);
}
