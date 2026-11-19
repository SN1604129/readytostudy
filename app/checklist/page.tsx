import type { Metadata } from "next";
import { DocumentChecklist } from "@/components/tools/document-checklist";

export const metadata: Metadata = {
  title: "Document Checklist Generator",
  description: "Generate a study abroad document checklist by destination, level and arrival plan.",
};

export default function ChecklistPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 md:py-20">
      <p className="text-[0.7rem] font-bold text-gold-500 uppercase">Document checklist</p>
      <h1 className="font-display mt-3 max-w-3xl text-4xl font-extrabold text-navy-950 md:text-5xl">
        Turn paperwork into a clear list
      </h1>
      <p className="mt-4 max-w-2xl text-navy-900/70">
        This checklist is a planning aid. Your counsellor will confirm final requirements for your institution and visa pathway.
      </p>
      <div className="mt-10">
        <DocumentChecklist />
      </div>
    </section>
  );
}
