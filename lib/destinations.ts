export type Destination = {
  slug: string;
  name: string;
  short: string;
  accent: string;      // tailwind-safe hex for country accent
  badge?: string;      // poster-style offer badge
  tagline: string;
  intro: string;
  perks: string[];
  highlights: string[];
  cities: string[];
  image?: string;
  imageSize?: { width: number; height: number };
  imageFit?: "cover" | "contain";
  /** Capital/major student city coordinates, used by destination comparison tools. */
  coords: { lat: number; lng: number; city: string };
};

/** Where our students travel from. */
export const origin = { name: "Dhaka", lat: 23.81, lng: 90.41 };

/**
 * Equirectangular projection retained for any future map-style comparison.
 * The projection deliberately draws no landmasses on its own, so it cannot
 * present inaccurate geography.
 */
export const mapWindow = { lonMin: -20, lonMax: 180, latMin: -45, latMax: 60, width: 900, height: 470 };

export function project(lat: number, lng: number) {
  const { lonMin, lonMax, latMin, latMax, width, height } = mapWindow;
  return {
    x: ((lng - lonMin) / (lonMax - lonMin)) * width,
    y: ((latMax - lat) / (latMax - latMin)) * height,
  };
}

export const destinations: Destination[] = [
  {
    slug: "australia",
    name: "Australia",
    short: "AU",
    accent: "#1d3e8f",
    tagline: "Study where we live.",
    intro:
      "Our head office is in Sydney — we guide you into Australian universities, TAFE and private providers with on-the-ground knowledge of the system you're entering.",
    perks: ["Visa eligibility assessment", "University consultation", "Documents guideline"],
    highlights: ["Post-study work rights", "World-ranked universities", "Local Sydney support after you arrive"],
    cities: ["Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth"],
    image: "/images/destination-australia.png",
    imageSize: { width: 1122, height: 1402 },
    coords: { lat: -33.87, lng: 151.21, city: "Sydney" },
  },
  {
    slug: "new-zealand",
    name: "New Zealand",
    short: "NZ",
    accent: "#0f766e",
    badge: "15–35% guaranteed scholarship",
    tagline: "Guaranteed scholarships. No service charge.",
    intro:
      "New Zealand combines high-quality education with clear residency pathways — and through our partners, a guaranteed 15–35% scholarship.",
    perks: [
      "Visa eligibility assessment",
      "15–35% guaranteed scholarship",
      "University & Subject Choice",
      "Documents guideline",
      "No Service Charge",
      "Permanent residency pathways",
    ],
    highlights: ["High quality education", "Pathway to residency", "Work opportunities"],
    cities: ["Auckland", "Wellington", "Christchurch", "Hamilton"],
    image: "/images/poster-nz-v2.jpg",
    coords: { lat: -36.85, lng: 174.76, city: "Auckland" },
  },
  {
    slug: "united-kingdom",
    name: "United Kingdom",
    short: "UK",
    accent: "#b91c1c",
    badge: "Absolutely FREE service",
    tagline: "A completely free pathway to UK universities.",
    intro:
      "One-year master's degrees, globally recognised universities and post-study visa pathways — with our UK service costing you absolutely nothing.",
    perks: [
      "Absolutely free service",
      "Visa eligibility assessment",
      "University & Subject Choice",
      "Documents guideline",
    ],
    highlights: ["1-year master's programs", "Post-study work pathways", "Historic, world-ranked institutions"],
    cities: ["London", "Manchester", "Birmingham", "Coventry"],
    image: "/images/poster-uk-v2.jpg",
    coords: { lat: 51.51, lng: -0.13, city: "London" },
  },
  {
    slug: "china",
    name: "China",
    short: "CN",
    accent: "#c2410c",
    badge: "Full funded scholarship",
    tagline: "Fully funded scholarships within reach.",
    intro:
      "China offers some of the most generous scholarship schemes anywhere — including fully funded places covering tuition and living costs.",
    perks: [
      "Full funded scholarship",
      "Visa eligibility assessment",
      "University & Subject Choice",
      "Documents guideline",
    ],
    highlights: ["Fully funded options", "Fast-growing global universities", "Low cost of living"],
    cities: ["Beijing", "Shanghai", "Nanjing", "Wuhan"],
    image: "/images/poster-china.jpg",
    coords: { lat: 39.90, lng: 116.41, city: "Beijing" },
  },
  {
    slug: "malaysia",
    name: "Malaysia",
    short: "MY",
    accent: "#7c3aed",
    badge: "Absolutely FREE service",
    tagline: "Top-ranked subjects, close to home.",
    intro:
      "Affordable tuition, credit transfer pathways and strong MBBS and Engineering programs — a few hours from Dhaka, with our service completely free.",
    perks: [
      "Absolutely free service",
      "Visa eligibility assessment",
      "University & Subject Choice",
      "Documents guideline",
      "Credit Transfer",
      "MBBS / Engineering / Top-ranked subjects",
    ],
    highlights: ["Credit transfer to AU/UK", "Affordable tuition & living", "Strong MBBS & Engineering"],
    cities: ["Kuala Lumpur", "Cyberjaya", "Penang"],
    image: "/images/destination-malaysia.png",
    imageSize: { width: 1003, height: 1568 },
    coords: { lat: 3.14, lng: 101.69, city: "Kuala Lumpur" },
  },
  {
    slug: "canada",
    name: "Canada",
    short: "CA",
    accent: "#b91c1c",
    badge: "2027 intake",
    tagline: "Your next study destination for 2027.",
    intro: "Plan your bachelor's, master's or PhD application with Ready to Study. Get help identifying exact programs and universities, preparing your documents and understanding the application steps for your chosen intake.",
    perks: ["Program and university selection", "Visa requirements and processing timeline guidance", "Step-by-step application guidance", "Free consultation"],
    highlights: ["2027 intake planning", "Bachelor's / Master's / PhD", "Personal application guidance"],
    cities: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
    image: "/images/poster-canada.png",
    imageSize: { width: 1407, height: 1760 },
    imageFit: "contain",
    coords: { lat: 43.65, lng: -79.38, city: "Toronto" },
  },
  {
    slug: "italy",
    name: "Italy",
    short: "IT",
    accent: "#15803d",
    badge: "100% scholarship opportunities",
    tagline: "Explore study and scholarship opportunities in Italy.",
    intro: "Explore Italian universities and scholarship opportunities with Ready to Study. Ask about our advertised 100% scholarship opportunities; eligibility, funding coverage and award conditions must be confirmed for your application. A counsellor can help you choose your university and subject and prepare your documents.",
    perks: ["Visa eligibility assessment", "University and subject selection", "Document preparation guidance", "Scholarship application guidance", "Free consultation"],
    highlights: ["Scholarship opportunities", "University and subject choice", "Guided document preparation"],
    cities: ["Rome", "Milan", "Bologna", "Turin"],
    image: "/images/poster-italy.png",
    imageSize: { width: 1368, height: 1824 },
    imageFit: "contain",
    coords: { lat: 41.90, lng: 12.50, city: "Rome" },
  },
];

export function getDestination(slug: string) {
  return destinations.find((d) => d.slug === slug);
}
