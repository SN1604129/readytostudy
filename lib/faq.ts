import type { ContentMeta } from "./content-meta";

/**
 * FAQ content. Only genuine, answerable questions — these also feed FAQ
 * structured data, so every answer must be accurate and non-promissory.
 */
export type Faq = ContentMeta & {
  id: string;
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    id: "cost",
    question: "How much does Ready to Study charge students?",
    answer:
      "Nothing. Counselling, course selection, admissions and visa support are free for students — Ready to Study is paid by partner institutions.",
    verified: true,
    lastUpdated: "August 2026",
  },
  {
    id: "where",
    question: "Where are your offices?",
    answer:
      "Rockdale in Sydney, Australia, and New Sobhanbag Road in Dhaka, Bangladesh. You can also speak with a counsellor online.",
    verified: true,
    lastUpdated: "August 2026",
  },
  {
    id: "language",
    question: "Can I speak with someone in Bangla?",
    answer: "Yes — our counsellors work in both Bangla and English.",
    verified: true,
    lastUpdated: "August 2026",
  },
  {
    id: "guarantee",
    question: "Can you guarantee a visa or a scholarship?",
    answer:
      "No. Visa decisions are made by government authorities and admission and scholarship decisions are made by institutions. Ready to Study prepares your application carefully and explains what each requirement means, but no agent can promise an outcome.",
    verified: true,
    lastUpdated: "August 2026",
  },
];
