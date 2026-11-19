// Course Finder dataset. NOTE FOR RTS: verify these course/university pairings
// against your live partner list before launch — they are realistic seeds,
// not confirmed placements.
export type CourseLevel =
  | "bachelors"
  | "masters"
  | "diploma"
  | "mres"
  | "doctorate"
  | "foundation"
  | "vet"
  | "english"
  | "school";

export type CourseBudget = "low" | "medium" | "high";
export type CourseStudyMode = "on-campus" | "online" | "hybrid" | "off-campus" | "overseas-campus";

export type Course = {
  verified?: boolean;
  sourceUrl?: string;
  title: string;
  university: string;
  destination: string; // slug
  level: CourseLevel;
  fields: string[];
  budget: CourseBudget;
  city?: string;
  campus?: string;
  studyMode?: CourseStudyMode;
  duration?: string;
  nextIntake?: string;
  intakes?: string[];
  currency?: string;
  tuitionPerYear?: number;
  ieltsScore?: number;
  hasScholarship?: boolean;
  hasInternship?: boolean;
  summary?: string;
  note?: string;
};

export type CourseMatch = {
  course: Course;
  score: number;
  scorePercent: number;
  reasons: string[];
};

export const courses: Course[] = [
  { title: "Bachelor of Cyber Security", university: "Torrens University Australia", destination: "australia", level: "bachelors", fields: ["it"], budget: "medium", note: "Alumni placement — see Alok's story" },
  { title: "Bachelor of Early Childhood Education and Care", university: "TAFE NSW", destination: "australia", level: "bachelors", fields: ["education"], budget: "low", note: "Alumni placement — see Henry's story" },
  { title: "Master of Public Health", university: "CQ University", destination: "australia", level: "masters", fields: ["health"], budget: "medium", note: "Alumni placement — see Mhafuza's story" },
  { title: "Master of Information Technology", university: "Torrens University Australia", destination: "australia", level: "masters", fields: ["it"], budget: "medium" },
  { title: "Master of Business Administration", university: "CQ University", destination: "australia", level: "masters", fields: ["business"], budget: "high" },
  { title: "Diploma of Nursing", university: "TAFE NSW", destination: "australia", level: "diploma", fields: ["health"], budget: "low" },
  { title: "Master of Research (MRes)", university: "Macquarie University", destination: "australia", level: "mres", fields: ["it", "engineering", "health"], budget: "high" },

  { title: "Bachelor of Computer & Information Sciences", university: "Auckland University of Technology", destination: "new-zealand", level: "bachelors", fields: ["it"], budget: "medium", note: "15–35% guaranteed scholarship" },
  { title: "Master of Applied Management", university: "Otago Polytechnic", destination: "new-zealand", level: "masters", fields: ["business"], budget: "low", note: "15–35% guaranteed scholarship" },
  { title: "Master of Engineering Studies", university: "University of Auckland", destination: "new-zealand", level: "masters", fields: ["engineering"], budget: "high" },
  { title: "Diploma in Hospitality Management", university: "NZMA", destination: "new-zealand", level: "diploma", fields: ["business"], budget: "low" },

  { title: "MSc Cyber Security", university: "Coventry University", destination: "united-kingdom", level: "masters", fields: ["it"], budget: "medium", note: "Service absolutely free" },
  { title: "MSc Public Health", university: "University of East London", destination: "united-kingdom", level: "masters", fields: ["health"], budget: "medium" },
  { title: "MBA Global Business", university: "Coventry University", destination: "united-kingdom", level: "masters", fields: ["business"], budget: "high" },
  { title: "BEng Civil Engineering", university: "University of East London", destination: "united-kingdom", level: "bachelors", fields: ["engineering"], budget: "high" },
  { title: "MRes Computing", university: "Birmingham City University", destination: "united-kingdom", level: "mres", fields: ["it"], budget: "high" },

  { title: "Bachelor of Software Engineering", university: "Nanjing University of Science & Technology", destination: "china", level: "bachelors", fields: ["it", "engineering"], budget: "low", note: "Full funded scholarship available" },
  { title: "MBBS (English-medium)", university: "Wuhan University", destination: "china", level: "bachelors", fields: ["health"], budget: "low", note: "Full funded scholarship available" },
  { title: "Master of International Business", university: "Beijing Institute of Technology", destination: "china", level: "masters", fields: ["business"], budget: "low", note: "Full funded scholarship available" },

  { title: "MBBS", university: "UCSI University", destination: "malaysia", level: "bachelors", fields: ["health"], budget: "medium", note: "Top-ranked medical program" },
  { title: "Bachelor of Mechanical Engineering", university: "Universiti Teknologi PETRONAS", destination: "malaysia", level: "bachelors", fields: ["engineering"], budget: "low", note: "Credit transfer pathways" },
  { title: "Bachelor of Computer Science", university: "Taylor's University", destination: "malaysia", level: "bachelors", fields: ["it"], budget: "low", note: "Credit transfer to AU/UK" },
  { title: "Master of Business Administration", university: "Taylor's University", destination: "malaysia", level: "masters", fields: ["business"], budget: "low" },
];

export const fields = [
  { id: "it", label: "IT & Computer Science" },
  { id: "business", label: "Business & Management" },
  { id: "health", label: "Health & Medicine" },
  { id: "engineering", label: "Engineering" },
  { id: "education", label: "Education" },
] as const;

export const levels = [
  { id: "bachelors", label: "Bachelor's" },
  { id: "masters", label: "Master's" },
  { id: "diploma", label: "Diploma" },
  { id: "mres", label: "MRes" },
  { id: "doctorate", label: "Doctorate" },
  { id: "foundation", label: "Foundation" },
  { id: "vet", label: "VET" },
  { id: "english", label: "English Language" },
  { id: "school", label: "School" },
] as const;

export const budgets = [
  { id: "low", label: "Budget-friendly", hint: "Lower tuition / scholarship-first" },
  { id: "medium", label: "Mid-range", hint: "Balanced tuition and living costs" },
  { id: "high", label: "Flexible", hint: "Best-fit course, whatever the cost" },
] as const;

export const studyModes = [
  { id: "on-campus", label: "On Campus" },
  { id: "online", label: "Online" },
  { id: "hybrid", label: "On Campus With Online Start" },
  { id: "off-campus", label: "Off Campus" },
  { id: "overseas-campus", label: "Overseas Campus" },
] as const;

export const durationBands = [
  { id: "under-1", label: "Less than 1 year" },
  { id: "1-2", label: "1 year to 2 years" },
  { id: "2-4", label: "2 years to 4 years" },
] as const;

export function matchCoursesFrom(
  courseList: Course[],
  opts: { destination?: string; level?: string; field?: string; budget?: string },
  limit = 3,
): CourseMatch[] {
  const scored = courseList
    .map((c) => {
      let score = 0;
      const reasons: string[] = [];
      if (opts.destination && c.destination === opts.destination) score += 4;
      if (opts.destination && c.destination === opts.destination) reasons.push("destination match");
      if (opts.level && c.level === opts.level) {
        score += 3;
        reasons.push("study level match");
      }
      if (opts.field && c.fields.includes(opts.field)) {
        score += 3;
        reasons.push("field match");
      }
      if (opts.budget && c.budget === opts.budget) {
        score += 1;
        reasons.push("budget comfort match");
      }
      return {
        course: c,
        score,
        scorePercent: Math.round((score / 11) * 100),
        reasons,
      };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function matchCourses(opts: { destination?: string; level?: string; field?: string; budget?: string }): CourseMatch[] {
  return matchCoursesFrom(courses, opts);
}
