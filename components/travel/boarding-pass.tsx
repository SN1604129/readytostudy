import type { ReactNode } from "react";
import { BookOpenCheck } from "lucide-react";

export type BoardingPassField = { label: string; value: string };

/**
 * Study-plan card used for course results, planning summaries and consultation
 * requests. The file name is retained for compatibility with existing imports.
 */
export function BoardingPass({
  from = "PROFILE",
  to,
  title,
  subtitle,
  fields = [],
  status,
  footer,
  children,
}: {
  from?: string;
  to: string;
  title: string;
  subtitle?: string;
  fields?: BoardingPassField[];
  status?: string;
  footer?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy-900/10 ring-1 ring-navy-100">
      <header className="flex items-center justify-between gap-4 bg-navy-950 px-6 py-4 text-white">
        <div>
          <p className="text-[0.65rem] font-bold tracking-[0.2em] text-gold-400 uppercase">
            Ready to Study
          </p>
          <p className="font-display text-lg font-extrabold">{title}</p>
          {subtitle && <p className="text-sm text-navy-100/80">{subtitle}</p>}
        </div>
        {status && (
          <span className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-[0.65rem] font-bold tracking-wide text-white uppercase">
            {status}
          </span>
        )}
      </header>

      <div className="grid gap-3 border-b border-navy-100 bg-ice px-6 py-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-navy-100">
          <p className="text-[0.62rem] font-bold tracking-[0.16em] text-navy-900/45 uppercase">
            Student profile
          </p>
          <p className="font-display mt-1 text-xl font-extrabold text-navy-900">{from}</p>
        </div>
        <span className="hidden h-11 w-11 place-items-center rounded-full bg-gold-500 text-navy-950 sm:grid">
          <BookOpenCheck size={20} aria-hidden />
        </span>
        <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-navy-100">
          <p className="text-[0.62rem] font-bold tracking-[0.16em] text-navy-900/45 uppercase">
            Plan focus
          </p>
          <p className="font-display mt-1 text-xl font-extrabold text-navy-900">{to}</p>
        </div>
      </div>

      {fields.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 px-6 py-5 sm:grid-cols-3">
          {fields.map((f) => (
            <div key={f.label}>
              <dt className="text-[0.65rem] font-bold tracking-[0.15em] text-navy-900/50 uppercase">
                {f.label}
              </dt>
              <dd className="mt-0.5 font-semibold text-navy-900">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {children && <div className="px-6 pb-5">{children}</div>}

      {footer && <div className="border-t border-navy-100 bg-ivory px-6 py-4">{footer}</div>}
    </article>
  );
}
