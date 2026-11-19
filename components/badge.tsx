/** Poster-style starburst offer badge (the red "Absolutely FREE Service" seal). */
export function OfferBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-badge-red px-4 py-1.5 text-xs font-extrabold tracking-wide text-white uppercase shadow-lg shadow-badge-red/30 ring-2 ring-white/60">
        {children}
      </span>
    </span>
  );
}
