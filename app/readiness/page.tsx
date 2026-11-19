import type { Metadata } from "next";
import { ReadinessDashboard } from "@/components/tools/readiness-dashboard";

export const metadata: Metadata = {
  title: "Readiness Dashboard",
  description: "Track your study abroad planning progress across destination, budget, courses and documents.",
};

export default function ReadinessPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[0.7rem] font-bold text-gold-500 uppercase">Readiness dashboard</p>
      <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold text-navy-950 md:text-5xl">
        See what is ready and what still needs attention
      </h1>
      <p className="mt-4 max-w-2xl text-navy-900/70">
        A simple progress view tied to your saved study plan. No sensitive documents are stored.
      </p>
      <div className="mt-10">
        <ReadinessDashboard />
      </div>
    </section>
  );
}
