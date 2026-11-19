import type { ContentMeta } from "./content-meta";

/**
 * Student cities, keyed to destinations.
 *
 * `traits` are neutral, checkable descriptors used by the city-preference
 * quiz — geography and scale only. Deliberately NO cost-of-living or safety
 * ratings: those would be unsupported claims. Cost guidance belongs in the
 * budget module, where it carries a source and a review date.
 */
export type CityTrait =
  | "major-city"
  | "coastal"
  | "capital"
  | "business-hub"
  | "university-city"
  | "smaller-city";

export type City = ContentMeta & {
  slug: string;
  name: string;
  destination: string;
  traits: CityTrait[];
  coords: { lat: number; lng: number };
};

export const cities: City[] = [
  // Australia
  { slug: "sydney", name: "Sydney", destination: "australia", traits: ["major-city", "coastal", "business-hub"], coords: { lat: -33.87, lng: 151.21 }, verified: true, lastUpdated: "August 2026" },
  { slug: "melbourne", name: "Melbourne", destination: "australia", traits: ["major-city", "coastal", "university-city"], coords: { lat: -37.81, lng: 144.96 }, verified: true, lastUpdated: "August 2026" },
  { slug: "brisbane", name: "Brisbane", destination: "australia", traits: ["major-city", "coastal"], coords: { lat: -27.47, lng: 153.03 }, verified: true, lastUpdated: "August 2026" },
  { slug: "adelaide", name: "Adelaide", destination: "australia", traits: ["coastal", "smaller-city", "university-city"], coords: { lat: -34.93, lng: 138.60 }, verified: true, lastUpdated: "August 2026" },
  { slug: "perth", name: "Perth", destination: "australia", traits: ["coastal", "major-city"], coords: { lat: -31.95, lng: 115.86 }, verified: true, lastUpdated: "August 2026" },
  // New Zealand
  { slug: "auckland", name: "Auckland", destination: "new-zealand", traits: ["major-city", "coastal", "business-hub"], coords: { lat: -36.85, lng: 174.76 }, verified: true, lastUpdated: "August 2026" },
  { slug: "wellington", name: "Wellington", destination: "new-zealand", traits: ["capital", "coastal", "smaller-city"], coords: { lat: -41.29, lng: 174.78 }, verified: true, lastUpdated: "August 2026" },
  { slug: "christchurch", name: "Christchurch", destination: "new-zealand", traits: ["coastal", "smaller-city", "university-city"], coords: { lat: -43.53, lng: 172.64 }, verified: true, lastUpdated: "August 2026" },
  { slug: "hamilton", name: "Hamilton", destination: "new-zealand", traits: ["smaller-city", "university-city"], coords: { lat: -37.79, lng: 175.28 }, verified: true, lastUpdated: "August 2026" },
  // United Kingdom
  { slug: "london", name: "London", destination: "united-kingdom", traits: ["capital", "major-city", "business-hub"], coords: { lat: 51.51, lng: -0.13 }, verified: true, lastUpdated: "August 2026" },
  { slug: "manchester", name: "Manchester", destination: "united-kingdom", traits: ["major-city", "university-city"], coords: { lat: 53.48, lng: -2.24 }, verified: true, lastUpdated: "August 2026" },
  { slug: "birmingham", name: "Birmingham", destination: "united-kingdom", traits: ["major-city", "university-city"], coords: { lat: 52.49, lng: -1.89 }, verified: true, lastUpdated: "August 2026" },
  { slug: "coventry", name: "Coventry", destination: "united-kingdom", traits: ["smaller-city", "university-city"], coords: { lat: 52.41, lng: -1.52 }, verified: true, lastUpdated: "August 2026" },
  // China
  { slug: "beijing", name: "Beijing", destination: "china", traits: ["capital", "major-city", "university-city"], coords: { lat: 39.90, lng: 116.41 }, verified: true, lastUpdated: "August 2026" },
  { slug: "shanghai", name: "Shanghai", destination: "china", traits: ["major-city", "coastal", "business-hub"], coords: { lat: 31.23, lng: 121.47 }, verified: true, lastUpdated: "August 2026" },
  { slug: "nanjing", name: "Nanjing", destination: "china", traits: ["major-city", "university-city"], coords: { lat: 32.06, lng: 118.80 }, verified: true, lastUpdated: "August 2026" },
  { slug: "wuhan", name: "Wuhan", destination: "china", traits: ["major-city", "university-city"], coords: { lat: 30.59, lng: 114.31 }, verified: true, lastUpdated: "August 2026" },
  // Malaysia
  { slug: "kuala-lumpur", name: "Kuala Lumpur", destination: "malaysia", traits: ["capital", "major-city", "business-hub"], coords: { lat: 3.14, lng: 101.69 }, verified: true, lastUpdated: "August 2026" },
  { slug: "cyberjaya", name: "Cyberjaya", destination: "malaysia", traits: ["smaller-city", "university-city"], coords: { lat: 2.92, lng: 101.66 }, verified: true, lastUpdated: "August 2026" },
  { slug: "penang", name: "Penang", destination: "malaysia", traits: ["coastal", "smaller-city"], coords: { lat: 5.42, lng: 100.33 }, verified: true, lastUpdated: "August 2026" },
];

export const cityTraitLabels: Record<CityTrait, string> = {
  "major-city": "Large, busy city",
  coastal: "Coastal",
  capital: "Capital city",
  "business-hub": "Business and industry hub",
  "university-city": "Strong student population",
  "smaller-city": "Smaller, quieter city",
};

export function citiesFor(destination: string) {
  return cities.filter((c) => c.destination === destination && c.active !== false);
}
