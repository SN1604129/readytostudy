import type { Metadata } from "next";
import { DestinationCompare } from "@/components/tools/destination-compare";
import { getCmsDestinations } from "@/lib/cms-destinations";

export const metadata: Metadata = {
  title: "Destination Comparison Desk",
  description: "Compare Ready to Study destinations by cities, highlights, offers and budget assumptions.",
};

export default async function ComparePage() {
  const destinations = await getCmsDestinations();
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[0.7rem] font-bold text-gold-500 uppercase">Comparison desk</p>
      <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold text-navy-950 md:text-5xl">
        Put your study destinations side by side
      </h1>
      <p className="mt-4 max-w-2xl text-navy-900/70">
        Compare only the information we can show honestly: offers, popular cities, highlights and verified assumptions.
      </p>
      <div className="mt-10">
        <DestinationCompare destinations={destinations} />
      </div>
    </section>
  );
}
