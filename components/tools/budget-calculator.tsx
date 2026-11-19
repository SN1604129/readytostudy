"use client";

import { useMemo, useState } from "react";
import { Calculator, Save, WalletCards } from "lucide-react";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { budgets } from "@/lib/courses";
import { getBudgetAssumption } from "@/lib/journey-content";
import { useJourney, type BudgetBand } from "@/lib/journey";

const inputCls =
  "focus-ring w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-semibold text-navy-900";

function bandFor(total: number): BudgetBand {
  if (total < 40000) return "low";
  if (total < 70000) return "medium";
  return "high";
}

export function BudgetCalculator({ destinations = defaults }: { destinations?: Destination[] }) {
  const { journey, update } = useJourney();
  const initialDestination = destinations.some(d => d.slug === journey.destination) ? journey.destination! : destinations[0].slug;
  const [destination, setDestination] = useState(initialDestination);
  const assumption = getBudgetAssumption(destination);
  const currency = assumption?.currency || "local currency";

  const [living, setLiving] = useState(assumption?.livingPerYear ?? 0);
  const [tuition, setTuition] = useState(initialDestination === "australia" ? 24000 : 0);
  const [healthCover, setHealthCover] = useState(initialDestination === "australia" ? 700 : 0);
  const [visaFees, setVisaFees] = useState(initialDestination === "australia" ? 1600 : 0);
  const [travelArrival, setTravelArrival] = useState(initialDestination === "australia" ? 1800 : 0);
  const [buffer, setBuffer] = useState(initialDestination === "australia" ? 2500 : 0);

  const total = useMemo(
    () => living + tuition + healthCover + visaFees + travelArrival + buffer,
    [living, tuition, healthCover, visaFees, travelArrival, buffer],
  );
  const monthly = Math.ceil(total / 12);
  const band = bandFor(total);
  const bandLabel = budgets.find((b) => b.id === band)?.label ?? "Flexible";

  const save = () => {
    update({
      destination,
      budget: band,
      budgetEstimate: {
        destination,
        currency,
        annualTotal: total,
        updatedAt: new Date().toISOString(),
      },
    });
  };

  const onDestination = (next: string) => {
    setDestination(next);
    const nextAssumption = getBudgetAssumption(next);
    setLiving(nextAssumption?.livingPerYear ?? 0);
    setTuition(0); setHealthCover(0); setVisaFees(0); setTravelArrival(0); setBuffer(0);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100 sm:p-8">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-gold-100 p-3 text-navy-800">
            <Calculator size={24} aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-2xl font-extrabold text-navy-950">
              Editable first-year estimate
            </h2>
            <p className="mt-1 text-sm text-navy-900/65">
              Start with the official Australia living-cost benchmark and adjust every assumption.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">Destination</span>
            <select value={destination} onChange={(e) => onDestination(e.target.value)} className={inputCls}>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">
              Living cost / year ({currency})
            </span>
            <input type="number" min={0} value={living} onChange={(e) => setLiving(Number(e.target.value))} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">
              Tuition / year ({currency})
            </span>
            <input type="number" min={0} value={tuition} onChange={(e) => setTuition(Number(e.target.value))} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">
              Health cover ({currency})
            </span>
            <input
              type="number"
              min={0}
              value={healthCover}
              onChange={(e) => setHealthCover(Number(e.target.value))}
              className={inputCls}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">
              Visa and processing ({currency})
            </span>
            <input type="number" min={0} value={visaFees} onChange={(e) => setVisaFees(Number(e.target.value))} className={inputCls} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">
              Travel and arrival costs ({currency})
            </span>
            <input type="number" min={0} value={travelArrival} onChange={(e) => setTravelArrival(Number(e.target.value))} className={inputCls} />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">
              Safety buffer ({currency})
            </span>
            <input type="number" min={0} value={buffer} onChange={(e) => setBuffer(Number(e.target.value))} className={inputCls} />
          </label>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-navy-900/55">
          {assumption?.verified
            ? `${assumption.livingSource}. Last reviewed: ${assumption.lastUpdated}.`
            : "This destination needs verified official figures. Edit the assumptions before relying on the total."}
        </p>
      </section>

      <aside className="rounded-3xl bg-navy-950 p-6 text-white shadow-xl shadow-navy-900/20 sm:p-8">
        <WalletCards className="text-gold-400" size={30} aria-hidden />
        <p className="mt-6 text-sm font-bold text-gold-400 uppercase">Estimated first year</p>
        <p className="font-display mt-2 text-5xl font-extrabold">
          {currency} {total.toLocaleString()}
        </p>
        <p className="mt-2 text-navy-100/70">
          About {currency} {monthly.toLocaleString()} per month across 12 months.
        </p>

        <div className="mt-8 rounded-2xl bg-white/[0.08] p-5 ring-1 ring-white/10">
          <p className="text-sm text-navy-100/70">Budget comfort band</p>
          <p className="font-display mt-1 text-2xl font-extrabold">{bandLabel}</p>
          <p className="mt-2 text-xs text-navy-100/55">
            This band powers your course finder matches. It is not visa or admission advice.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          className="focus-ring mt-8 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-extrabold text-navy-950 shadow-lg shadow-gold-500/25 transition-transform hover:scale-105 active:scale-[0.98]"
        >
          <Save size={18} /> Save to study plan
        </button>
      </aside>
    </div>
  );
}
