/**
 * Ready to Study team.
 *
 * Names, roles and quotes are taken verbatim from material supplied by
 * Ready to Study. Do NOT write new statements and attribute them to these
 * people — add new quotes only when the team supplies them.
 *
 * CONTENT GAP: individual headshot files have not been supplied. Until they
 * are, cards render an initials avatar. Drop files into
 * /public/images/team/<slug>.jpg and set `photo` to enable real portraits.
 */

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  office: "sydney" | "bangladesh" | "unspecified";
  /** Verbatim advice supplied by Ready to Study. */
  quote: string;
  photo?: string;
};

export const team: TeamMember[] = [
  {
    slug: "mashfi-rahman",
    name: "MD Mashfi Rahman",
    role: "CEO & Founder",
    office: "sydney",
    quote:
      "Choosing the right study destination is one of the most important decisions for a student's future. My advice to students is to focus not only on rankings but also on course quality, career outcomes, and long-term opportunities. Careful planning and the right guidance can make your international education journey successful and rewarding.",
  },
  {
    slug: "toufiqul-islam",
    name: "Md Toufiqul Islam",
    role: "Country Manager",
    office: "bangladesh",
    quote:
      "Students should start preparing early for their study abroad journey. Research your course options, understand visa requirements, and ensure your academic and financial documents are properly prepared. Being organized and well-informed will make the application and visa process much smoother.",
  },
  {
    slug: "kaniz-fatema",
    name: "Kaniz Fatema",
    role: "Lead Counsellor",
    office: "unspecified",
    quote:
      "Every student has unique goals and potential. It is important to choose a course that matches your interests, strengths, and future career plans. Take time to explore different pathways and always seek professional guidance before making your final decision.",
  },
  {
    slug: "taspia-islam",
    name: "Taspia Islam",
    role: "Business Development Executive",
    office: "unspecified",
    quote:
      "Research is essential before applying. Explore universities, scholarships, and program options thoroughly. The right information empowers students to make informed choices.",
  },
  {
    slug: "earun-nesa-lia",
    name: "Earun Nesa Lia",
    role: "Counsellor",
    office: "unspecified",
    quote:
      "Start your study abroad journey with a clear goal. Understanding your interests and career aspirations helps in selecting the right course and university. Early planning always pays off.",
  },
  {
    slug: "abdullah-al-jubayer",
    name: "Abdullah Al Jubayer",
    role: "Counsellor",
    office: "unspecified",
    quote:
      "Don't underestimate the importance of visa preparation. Make sure your documents are accurate, complete, and submitted on time. Attention to detail can save you from delays and stress.",
  },
  {
    slug: "nazimul-islam-nayem",
    name: "Md Nazimul Islam Nayem",
    role: "Documentation Officer",
    office: "unspecified",
    quote:
      "Proper documentation is the foundation of a smooth application process. Keep your academic, financial, and identification papers organized and updated to avoid last-minute hurdles.",
  },
  {
    slug: "asheque-mahmud-shohan",
    name: "Asheque Mahmud Shohan",
    role: "Counsellor",
    office: "unspecified",
    quote:
      "Choosing the right pathway is key to long-term success. Consider course relevance, university recognition, and career opportunities before making decisions.",
  },
];

export function initials(name: string) {
  const parts = name.replace(/^(MD|Md)\s+/i, "").trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}
