import { randomUUID } from "node:crypto";
import { mutateDocument, readDocument } from "./persistent-data.ts";
import { applyJourneyCommand, emptyJourney, type JourneyCommand, type JourneyState } from "./journey-state.ts";
import type { AdvisorMessage, Source } from "./advisor/types.ts";

export type Activity = {
  id: string; createdAt: string; type: "account" | "study" | "visit" | "enquiry" | "chat" | "admin";
  title: string; detail?: string; href?: string;
  exchange?: { question: string; reply: string; sources: Source[] };
};
type AccountRecord = { journey: JourneyState; activities: Activity[] };
const blank = (): AccountRecord => ({ journey: { ...emptyJourney }, activities: [] });
function key(userId: string) {
  if (!/^[a-f0-9]{32}$/.test(userId)) throw new Error("Invalid account.");
  return `account-${userId}`;
}
export async function getAccount(userId: string) {
  const account = await readDocument<AccountRecord>(key(userId), blank());
  const conversation: AdvisorMessage[] = account.activities.filter(item => item.exchange).slice(0, 3).reverse()
    .flatMap(item => [{ role: "user" as const, content: item.exchange!.question }, { role: "assistant" as const, content: item.exchange!.reply }]);
  return { journey: account.journey, conversation };
}
export async function getAccountHistory(userId: string, before?: string) {
  const account = await readDocument<AccountRecord>(key(userId), blank());
  const start = before ? account.activities.findIndex(item => item.id === before) + 1 : 0;
  if (before && start === 0) return { activities: [], nextCursor: null };
  const activities = account.activities.slice(start, start + 30);
  return { activities, nextCursor: start + 30 < account.activities.length ? activities.at(-1)!.id : null };
}
export async function recordActivity(userId: string, activity: Omit<Activity, "id" | "createdAt"> & { id?: string }) {
  const item: Activity = { ...activity, id: activity.id || randomUUID(), createdAt: new Date().toISOString() };
  await mutateDocument<AccountRecord, void>(key(userId), blank(), account => {
    if (!account.activities.some(existing => existing.id === item.id)) account.activities.unshift(item);
    return { value: account, result: undefined };
  });
}
export async function recordEnquiryActivity(userId: string, enquiryId: string, reference: string, destination: string) {
  await mutateDocument<AccountRecord, void>(key(userId), blank(), account => {
    const id = `enquiry-${enquiryId}`;
    account.journey.consultationRequested = true;
    if (!account.activities.some(item => item.id === id)) account.activities.unshift({ id, createdAt: new Date().toISOString(), type: "enquiry", title: "Enquiry submitted", detail: `${reference} · ${destination}`, href: "/student/history" });
    return { value: account, result: undefined };
  });
}
export async function saveJourneyCommand(userId: string, id: string, command: JourneyCommand) {
  return mutateDocument<AccountRecord, JourneyState>(key(userId), blank(), account => {
    if (account.activities.some(item => item.id === id)) return { value: account, result: account.journey };
    const next = applyJourneyCommand(account.journey, command);
    const titles = { patch: "Study preferences updated", priority: "Study priorities updated", checklist: "Document checklist updated", stamp: "Destination explored", "save-course": "Course saved", "remove-course": "Course removed", reset: "Study plan reset" };
    const detail = command.type === "patch" ? Object.entries(command.patch).map(([name, value]) => name === "budgetEstimate" && value && typeof value === "object" ? `Budget: ${value.currency} ${value.annualTotal}` : `${name}: ${value ?? "cleared"}`).join(" · ")
      : command.type === "save-course" ? `${command.course.title} · ${command.course.university}`
      : command.type === "remove-course" ? command.title : command.type === "reset" ? undefined : command.id;
    account.journey = next;
    account.activities.unshift({ id, createdAt: new Date().toISOString(), type: "study", title: titles[command.type], detail });
    return { value: account, result: next };
  });
}

/** Accept only study data; identity, ownership and audit text always come from the server. */
export function parseJourneyCommand(input: unknown): JourneyCommand {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid study action.");
  const value = input as Record<string, unknown>;
  const text = (entry: unknown, max = 120) => {
    if (typeof entry !== "string" || !entry.trim() || entry.length > max) throw new Error("Please check your study preferences.");
    return entry.trim();
  };
  if (value.type === "reset") return { type: "reset" };
  if (value.type === "priority" || value.type === "checklist" || value.type === "stamp") return { type: value.type, id: text(value.id) };
  if (value.type === "remove-course") return { type: value.type, title: text(value.title, 300) };
  if (value.type === "save-course") {
    const course = value.course as Record<string, unknown> | null;
    if (!course || typeof course !== "object") throw new Error("Invalid course.");
    return { type: value.type, course: { title: text(course.title, 300), university: text(course.university, 300), destination: text(course.destination) } };
  }
  if (value.type !== "patch" || !value.patch || typeof value.patch !== "object" || Array.isArray(value.patch)) throw new Error("Invalid study action.");
  const patch: Record<string, unknown> = {};
  for (const [name, entry] of Object.entries(value.patch)) {
    if (!["destination", "level", "field", "budget", "englishStatus", "budgetEstimate"].includes(name)) throw new Error("Invalid study preference.");
    if (entry === null || entry === "") { patch[name] = undefined; continue; }
    if (name === "budgetEstimate") {
      const estimate = entry as Record<string, unknown> | null;
      if (!estimate || typeof estimate !== "object" || typeof estimate.annualTotal !== "number" || !Number.isFinite(estimate.annualTotal) || estimate.annualTotal < 0 || estimate.annualTotal > 1e9) throw new Error("Invalid budget estimate.");
      patch[name] = { destination: text(estimate.destination), currency: text(estimate.currency, 20), annualTotal: estimate.annualTotal, updatedAt: new Date().toISOString() };
    } else {
      const allowed = name === "level" ? ["bachelors", "masters", "diploma", "mres", "doctorate", "foundation", "vet", "english", "school"] : name === "budget" ? ["low", "medium", "high"] : name === "englishStatus" ? ["not-started", "booked", "completed", "exempt"] : null;
      patch[name] = text(entry);
      if (allowed && !allowed.includes(patch[name] as string)) throw new Error("Invalid study preference.");
    }
  }
  if (!Object.keys(patch).length) throw new Error("Choose a study preference first.");
  return { type: "patch", patch } as JourneyCommand;
}
