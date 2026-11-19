import type { Course, CourseMatch } from "../courses";

export type Preferences = { destination?: string; level?: string; field?: string; budget?: string };
export type Source = { title: string; url: string; excerpt: string; domain: string; checkedAt: string };
export type AdvisorMessage = { role: "user" | "assistant"; content: string };
export type AdvisorStatus = {
  available: boolean;
  searchAvailable: boolean;
  signedIn: boolean;
  userId?: string;
  remaining: number;
  searchesRemaining: number;
  resetAt?: string;
  turnstileSiteKey: string;
  reason?: string;
};
export type AdvisorReply = {
  reply: string;
  preferences: Preferences;
  courses: CourseMatch[];
  sources: Source[];
  cached?: boolean;
  fallback?: boolean;
  status?: AdvisorStatus;
  retryAfter?: number;
};
export type AdvisorCourse = Course;
