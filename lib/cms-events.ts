import { readDocument, writeDocument } from "./persistent-data.ts";
import { cashbackPromotion, demoEvent, events, type RtsEvent } from "./events.ts";
import { isPublishable } from "./content-meta.ts";

export type CmsEvent = RtsEvent & { status: "draft" | "upcoming" | "past" | "offer" };
const defaults: CmsEvent[] = [
  { ...cashbackPromotion, status: "offer" },
  { ...demoEvent, status: "past" },
  ...events.map(event => ({ ...event, status: "past" as const })),
];

export function safeImageUrl(value: unknown) {
  if (typeof value !== "string" || value.length > 2000) return false;
  if (/^\/(?:images|uploads)\/[a-zA-Z0-9/_.%() -]+$/.test(value) && !value.includes("..")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

export function normalizeEvents(input: unknown): CmsEvent[] {
  if (!Array.isArray(input) || input.length > 200) throw new Error("Supply up to 200 events.");
  const slugs = new Set<string>();
  return input.map((raw) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid event.");
    const field = (key: string, max: number, required = false): string => {
      const value = raw[key];
      if (value !== undefined && typeof value !== "string") throw new Error(`Invalid ${key}.`);
      const text = (value ?? "").trim();
      if (text.length > max || (required && !text)) throw new Error(`Please check the event ${key} (maximum ${max} characters).`);
      return text;
    };
    const slug = field("slug", 100, true);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slugs.has(slug)) throw new Error("Event slugs must be unique and contain lowercase letters, numbers and hyphens.");
    slugs.add(slug);
    if (!["conference", "seminar", "webinar", "promotion"].includes(raw.kind)) throw new Error("Choose a valid event type.");
    if (!["draft", "upcoming", "past", "offer"].includes(raw.status)) throw new Error("Choose a valid event status.");
    if (!Array.isArray(raw.images) || raw.images.length > 8) throw new Error("Supply up to eight event images.");
    const images = raw.images.map((image: { src?: unknown; alt?: unknown }) => {
      if (!image || !safeImageUrl(image.src) || typeof image.alt !== "string" || !image.alt.trim() || image.alt.length > 300) throw new Error("Each image needs a valid HTTPS or local image URL and a description.");
      return { src: image.src as string, alt: image.alt.trim() };
    });
    const partners = raw.partners ?? [];
    if (!Array.isArray(partners) || partners.length > 20 || partners.some((p: unknown) => typeof p !== "string" || p.length > 150)) throw new Error("Check the event partners.");
    return {
      slug, name: field("name", 180, true), summary: field("summary", 3000, true),
      kind: raw.kind, status: raw.status, date: field("date", 160) || undefined,
      location: field("location", 250) || undefined, images, partners,
      disclaimer: field("disclaimer", 1000) || undefined,
      verified: raw.verified === true, active: raw.active !== false,
      sourceLabel: field("sourceLabel", 200) || "Ready to Study",
      lastUpdated: new Intl.DateTimeFormat("en", { month: "long", year: "numeric", timeZone: "Asia/Dhaka" }).format(new Date()),
    };
  });
}

export async function getCmsEvents() {
  return readDocument<CmsEvent[]>("events", defaults);
}

export async function getPublicEvents() {
  return (await getCmsEvents()).filter(event => event.status !== "draft" && isPublishable(event));
}

export async function saveCmsEvents(input: unknown) {
  const normalized = normalizeEvents(input);
  await writeDocument("events", normalized);
  return normalized;
}
