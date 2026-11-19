import {
  GraduationCap, Award, FileCheck2, MessagesSquare, StampIcon,
  ArrowLeftRight, Repeat2, Home, HeartHandshake, Plane, Compass,
  type LucideIcon,
} from "lucide-react";

export type Service = {
  slug: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
};

export const services: Service[] = [
  { slug: "course-university-selection", title: "Course & University Selection", icon: GraduationCap,
    blurb: "We match your grades, goals and budget to the right course and institution across our study destinations." },
  { slug: "scholarships", title: "Scholarships", icon: Award,
    blurb: "From guaranteed partner scholarships to fully funded options, we find funding you actually qualify for." },
  { slug: "admission-support", title: "Admission Support", icon: FileCheck2,
    blurb: "Applications, offer letters and enrolment — prepared correctly the first time." },
  { slug: "counselling", title: "Counselling", icon: MessagesSquare,
    blurb: "One-on-one guidance in English or Bangla, from your first question to your first day of class." },
  { slug: "visa-processing", title: "Visa Processing", icon: StampIcon,
    blurb: "Document checklists, financial evidence guidance and lodgement support for student visas." },
  { slug: "institute-migration", title: "Institute Migration", icon: ArrowLeftRight,
    blurb: "Already abroad? We help you move institutions without risking your visa status." },
  { slug: "course-provider-change", title: "Course or Provider Change", icon: Repeat2,
    blurb: "Change your course or provider with the paperwork and conditions handled properly." },
  { slug: "accommodation-support", title: "Accommodation Support", icon: Home,
    blurb: "Land with a place to stay — student housing and rental guidance near your campus." },
  { slug: "spouse-visa", title: "Spouse Visa", icon: HeartHandshake,
    blurb: "Bring your partner with you. We prepare dependent and spouse visa applications." },
  { slug: "tourist-visa", title: "Tourist Visa", icon: Plane,
    blurb: "Visitor visa applications for family who want to attend your graduation — or just visit." },
  { slug: "career-counseling", title: "Career Counseling", icon: Compass,
    blurb: "Course choices mapped to real career and post-study work outcomes, not guesswork." },
];
