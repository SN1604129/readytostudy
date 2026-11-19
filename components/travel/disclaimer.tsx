import { Info } from "lucide-react";

/**
 * Standard disclaimer used by every guidance tool.
 *
 * Ready to Study does not make government decisions. Nothing on this site
 * predicts or guarantees admission, scholarships or visa outcomes.
 */
export function Disclaimer({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "quiet";
}) {
  if (tone === "quiet") {
    return (
      <p className="mt-4 text-xs leading-relaxed text-navy-900/60">{children}</p>
    );
  }
  return (
    <div className="mt-6 flex gap-3 rounded-2xl bg-ivory px-5 py-4 ring-1 ring-gold-500/25">
      <Info size={18} className="mt-0.5 shrink-0 text-gold-500" aria-hidden />
      <p className="text-sm leading-relaxed text-navy-900/75">{children}</p>
    </div>
  );
}

/** Reusable wording so guidance language stays consistent across tools. */
export const guidanceNote =
  "This is an indicative guidance tool based on the information you provide — not an admission, scholarship or visa assessment. Requirements vary by institution and applicant, and change over time. Confirm current requirements with a qualified adviser before applying.";

export function LastUpdated({
  date,
  source,
}: {
  date: string;
  source?: string;
}) {
  return (
    <p className="mt-3 text-xs text-navy-900/50">
      Figures last reviewed {date}
      {source ? ` · ${source}` : ""}. Estimates only — verify current figures before relying on them.
    </p>
  );
}
