import { readDocument, writeDocument } from "./persistent-data.ts";
import { destinations as fallbackDestinations, type Destination } from "./destinations.ts";
import { safeImageUrl } from "./cms-events.ts";


function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function normalizeDestination(raw: Partial<Destination>, index = 0): Destination {
  const name = text(raw.name, `New destination ${index + 1}`);
  const slug = slugify(text(raw.slug, name)) || `destination-${index + 1}`;
  const cities = stringArray(raw.cities);
  const fallbackCity = raw.coords?.city ?? cities[0] ?? name;

  return {
    slug,
    name,
    short: text(raw.short, name.slice(0, 2).toUpperCase()).slice(0, 4).toUpperCase(),
    accent: text(raw.accent, "#1d3e8f"),
    badge: text(raw.badge) || undefined,
    tagline: text(raw.tagline, "A destination Ready to Study can guide you through."),
    intro: text(raw.intro, "Add the destination overview from the admin dashboard."),
    perks: stringArray(raw.perks).length ? stringArray(raw.perks) : ["Counselling", "Application support"],
    highlights: stringArray(raw.highlights).length ? stringArray(raw.highlights) : ["Guided application"],
    cities: cities.length ? cities : [fallbackCity],
    image: text(raw.image) || undefined,
    imageSize: raw.imageSize,
    imageFit: raw.imageFit === "contain" ? "contain" : undefined,
    coords: {
      lat: numberValue(raw.coords?.lat, 0),
      lng: numberValue(raw.coords?.lng, 0),
      city: text(raw.coords?.city, fallbackCity),
    },
  };
}

export async function getCmsDestinations(): Promise<Destination[]> {
  const stored = await readDocument<Partial<Destination>[] | { version: 2; items: Destination[] } | null>("destinations", null);
  if (!stored) return fallbackDestinations;
  if (!Array.isArray(stored)) return stored.items;
  // Upgrade the original five-country catalogue once. Saving v2 preserves later deletions.
  const additions = fallbackDestinations.filter(item => ["canada", "italy"].includes(item.slug) && !stored.some(existing => existing.slug === item.slug));
  return [...stored.map((item, index) => normalizeDestination(item, index)), ...additions];
}

export async function getCmsDestination(slug: string) {
  return (await getCmsDestinations()).find((destination) => destination.slug === slug);
}

export async function saveCmsDestinations(input: unknown) {
  if (!Array.isArray(input) || !input.length || input.length > 100) throw new Error("Supply between one and 100 destinations.");
  if (input.some(item => !item || typeof item !== "object")) throw new Error("Invalid destination.");
  const normalized = input.map((destination, index) =>
    normalizeDestination(destination as Partial<Destination>, index),
  );
  const slugs = new Set<string>();
  for (const item of normalized) {
    if (slugs.has(item.slug)) throw new Error("Each destination must have a unique slug.");
    slugs.add(item.slug);
    if (!/^#[a-fA-F0-9]{6}$/.test(item.accent)) throw new Error("Use a six-digit hex accent color, such as #1d3e8f.");
    if (item.image && !safeImageUrl(item.image)) throw new Error("Use an HTTPS image URL or an uploaded image.");
    if (Math.abs(item.coords.lat) > 90 || Math.abs(item.coords.lng) > 180) throw new Error("Check the destination coordinates.");
    if (item.name.length > 120 || item.slug.length > 100 || item.intro.length > 5000) throw new Error("Please shorten the destination name, slug or overview.");
  }
  await writeDocument("destinations", { version: 2, items: normalized });
  return normalized;
}
