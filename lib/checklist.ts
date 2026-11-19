import { destinations } from "@/lib/destinations";

export type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
  group: "identity" | "academic" | "financial" | "visa" | "arrival";
  requiredFor?: string[];
  levels?: string[];
};

export const checklistGroups: Record<ChecklistItem["group"], string> = {
  identity: "Identity",
  academic: "Academic",
  financial: "Financial",
  visa: "Visa",
  arrival: "Arrival",
};

export const baseChecklist: ChecklistItem[] = [
  {
    id: "passport",
    group: "identity",
    label: "Valid passport",
    detail: "Keep a clear scan ready. Renew early if it expires soon.",
  },
  {
    id: "photo",
    group: "identity",
    label: "Passport-size photo",
    detail: "Follow the destination visa photo standard before uploading.",
  },
  {
    id: "academic-transcripts",
    group: "academic",
    label: "Academic transcripts and certificates",
    detail: "Include final certificates plus grading scale if available.",
  },
  {
    id: "sop",
    group: "academic",
    label: "Statement of purpose",
    detail: "Explain course fit, career goals and why this destination makes sense.",
  },
  {
    id: "cv",
    group: "academic",
    label: "CV or resume",
    detail: "Required for many postgraduate and research applications.",
    levels: ["masters", "mres"],
  },
  {
    id: "research-proposal",
    group: "academic",
    label: "Research proposal",
    detail: "Prepare supervisor interests, methodology and topic rationale.",
    levels: ["mres"],
  },
  {
    id: "english",
    group: "academic",
    label: "English test evidence",
    detail: "IELTS, PTE, TOEFL or exemption evidence depending on provider rules.",
  },
  {
    id: "financial-capacity",
    group: "financial",
    label: "Financial capacity evidence",
    detail: "Bank statements, sponsor evidence and source-of-funds documents.",
  },
  {
    id: "sponsor-affidavit",
    group: "financial",
    label: "Sponsor affidavit or relationship proof",
    detail: "Needed when a parent, spouse or relative supports your study plan.",
  },
  {
    id: "coe-offer",
    group: "visa",
    label: "Offer letter / enrolment confirmation",
    detail: "Exact document name differs by destination and institution.",
  },
  {
    id: "health-cover",
    group: "visa",
    label: "Health cover or medical insurance",
    detail: "Australia requires OSHC. Other destinations may have their own rules.",
    requiredFor: ["australia"],
  },
  {
    id: "medical-police",
    group: "visa",
    label: "Medical and police checks",
    detail: "Complete only when instructed for your visa pathway.",
  },
  {
    id: "departure-plan",
    group: "arrival",
    label: "Accommodation and arrival plan",
    detail: "Temporary stay, airport arrival, transport and first-week contacts.",
  },
];

export function getChecklist({
  destination,
  level,
  includeArrival,
}: {
  destination?: string;
  level?: string;
  includeArrival?: boolean;
}) {
  const knownDestination = destinations.some((d) => d.slug === destination);
  return baseChecklist.filter((item) => {
    if (item.requiredFor && (!knownDestination || !item.requiredFor.includes(destination ?? ""))) {
      return false;
    }
    if (item.levels && (!level || !item.levels.includes(level))) return false;
    if (item.group === "arrival" && !includeArrival) return false;
    return true;
  });
}
