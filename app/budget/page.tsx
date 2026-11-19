import type { Metadata } from "next";
import { BudgetCalculator } from "@/components/tools/budget-calculator";
import { getCmsDestinations } from "@/lib/cms-destinations";

export const metadata: Metadata = {
  title: "Budget Calculator",
  description:
    "Estimate first-year study costs using editable assumptions, including the AUD 29,710 Australia living-cost benchmark.",
};

export default async function BudgetPage() {
  const destinations = await getCmsDestinations();
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[0.7rem] font-bold text-gold-500 uppercase">Budget calculator</p>
      <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold text-navy-950 md:text-5xl">
        Know the money before the paperwork starts
      </h1>
      <p className="mt-4 max-w-2xl text-navy-900/70">
        A transparent estimate for planning conversations. Every number is editable and should be confirmed before visa lodgement.
      </p>
      <div className="mt-10">
        <BudgetCalculator destinations={destinations} />
      </div>
    </section>
  );
}
