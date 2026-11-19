import { readDocument, writeDocument } from "./persistent-data";
import {
  budgets,
  courses as fallbackCourses,
  fields,
  levels,
  studyModes,
  type Course,
} from "@/lib/courses";

const levelIds = new Set(levels.map((level) => level.id));
const budgetIds = new Set(budgets.map((budget) => budget.id));
const fieldIds = new Set(fields.map((field) => field.id));
const studyModeIds = new Set(studyModes.map((mode) => mode.id));


function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function stringArray(value: unknown) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function numberValue(value: unknown) {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function booleanValue(value: unknown) {
  return value === true || value === "true" || value === "on" || value === "yes";
}

function courseLevel(value: unknown): Course["level"] {
  const next = text(value);
  return levelIds.has(next as Course["level"]) ? (next as Course["level"]) : "bachelors";
}

function studyMode(value: unknown): Course["studyMode"] {
  const next = text(value);
  return studyModeIds.has(next as NonNullable<Course["studyMode"]>)
    ? (next as NonNullable<Course["studyMode"]>)
    : "on-campus";
}

function budget(value: unknown): Course["budget"] {
  const next = text(value);
  return budgetIds.has(next as Course["budget"]) ? (next as Course["budget"]) : "medium";
}

function courseFields(value: unknown) {
  const cleaned = stringArray(value).filter((item) => fieldIds.has(item as (typeof fields)[number]["id"]));
  return cleaned.length ? cleaned : ["business"];
}

export function normalizeCourse(raw: Partial<Course>, index = 0): Course {
  const currency = text(raw.currency, "AUD").toUpperCase().slice(0, 4);
  const tuitionPerYear = numberValue(raw.tuitionPerYear);
  const ieltsScore = numberValue(raw.ieltsScore);

  return {
    verified: raw.verified === true,
    sourceUrl: typeof raw.sourceUrl === "string" && /^https:\/\//.test(raw.sourceUrl) ? raw.sourceUrl.trim() : undefined,
    title: text(raw.title, `New course ${index + 1}`),
    university: text(raw.university, "University name"),
    destination: text(raw.destination, "australia").toLowerCase(),
    level: courseLevel(raw.level),
    fields: courseFields(raw.fields),
    budget: budget(raw.budget),
    city: text(raw.city) || undefined,
    campus: text(raw.campus) || undefined,
    studyMode: studyMode(raw.studyMode),
    duration: text(raw.duration) || undefined,
    nextIntake: text(raw.nextIntake) || undefined,
    intakes: stringArray(raw.intakes),
    currency,
    tuitionPerYear,
    ieltsScore,
    hasScholarship: booleanValue(raw.hasScholarship),
    hasInternship: booleanValue(raw.hasInternship),
    summary: text(raw.summary) || undefined,
    note: text(raw.note) || undefined,
  };
}

export async function getCmsCourses(): Promise<Course[]> {
  const stored = await readDocument<Partial<Course>[] | null>("courses", null);
  if (!stored || !Array.isArray(stored)) return fallbackCourses;
  return stored.map((item, index) => normalizeCourse(item, index));
}

export async function saveCmsCourses(input: unknown) {
  if (!Array.isArray(input)) throw new Error("Courses payload must be an array.");
  const normalized = input.map((course, index) => normalizeCourse(course as Partial<Course>, index));
  await writeDocument("courses", normalized);
  return normalized;
}
