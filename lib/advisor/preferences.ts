import { budgets, fields, levels, matchCoursesFrom, type Course } from "../courses.ts";
import type { Preferences } from "./types.ts";

export function parsePreferences(value: unknown, destinationIds: string[]): Preferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const raw = value as Record<string, unknown>;
  const allowed: Record<keyof Preferences, readonly string[]> = {
    destination: destinationIds, level: levels.map(x => x.id), field: fields.map(x => x.id), budget: budgets.map(x => x.id),
  };
  const result: Preferences = {};
  for (const key of Object.keys(allowed) as (keyof Preferences)[]) {
    if (raw[key] === undefined || raw[key] === "") continue;
    if (typeof raw[key] !== "string" || !allowed[key].includes(raw[key] as string)) throw new Error("Please choose a valid study preference.");
    result[key] = raw[key] as string;
  }
  return result;
}

/** Only unambiguous refinements are applied automatically; other changes use the visible filters. */
export function refinePreferences(current: Preferences, message: string): Preferences {
  const next = { ...current };
  const text = message.toLowerCase();
  if (/\b(not|don't|do not|except|avoid|compare|versus|vs)\b|না\b/u.test(text)) return next;
  const groups: [keyof Preferences, [string, RegExp][]][] = [
    ["destination", [["australia", /\baustralia\b|অস্ট্রেলিয়া/u], ["new-zealand", /\bnew zealand\b|নিউজিল্যান্ড/u], ["united-kingdom", /\b(uk|united kingdom|britain)\b|যুক্তরাজ্য/u], ["malaysia", /\bmalaysia\b|মালয়েশিয়া/u], ["china", /\bchina\b|চীন/u]]],
    ["level", [["bachelors", /\b(bachelor'?s?|undergraduate)\b/u], ["masters", /\b(master'?s?|msc|mba)\b/u], ["diploma", /\bdiploma\b/u], ["doctorate", /\b(phd|doctorate)\b/u]]],
    ["field", [["it", /\b(computer science|cyber security|cybersecurity|software|information technology)\b/u], ["business", /\b(business|management|mba)\b/u], ["health", /\b(nursing|medicine|public health|mbbs)\b/u], ["engineering", /\bengineering\b/u], ["education", /\b(teaching|education)\b/u]]],
    ["budget", [["low", /\b(cheaper|affordable|low budget|budget-friendly)\b|কম খরচ|কম বাজেট/u], ["high", /\b(flexible budget|any budget)\b/u]]],
  ];
  for (const [key, options] of groups) {
    const matches = options.filter(([, pattern]) => pattern.test(text));
    if (matches.length === 1) next[key] = matches[0][0];
  }
  return next;
}

export function exactMatches(courses: Course[], preferences: Preferences) {
  const filtered = courses.filter(c =>
    (!preferences.destination || c.destination === preferences.destination) &&
    (!preferences.level || c.level === preferences.level) &&
    (!preferences.field || c.fields.includes(preferences.field)) &&
    (!preferences.budget || c.budget === preferences.budget));
  if (!Object.values(preferences).some(Boolean)) return [];
  return matchCoursesFrom(filtered, preferences, 4);
}

export function preferenceSummary(p: Preferences) {
  return [p.destination?.replaceAll("-", " "), levels.find(x => x.id === p.level)?.label,
    fields.find(x => x.id === p.field)?.label, budgets.find(x => x.id === p.budget)?.label].filter(Boolean).join(" · ");
}
