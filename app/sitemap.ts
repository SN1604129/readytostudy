import type { MetadataRoute } from "next";
import { getCmsDestinations } from "@/lib/cms-destinations";
import { courseOptions, supportCourses } from "@/lib/pte-ielts";
import { site } from "@/lib/site";

const baseUrl = `https://${site.domain}`;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const destinations = await getCmsDestinations();
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/pte-ielts-support",
    "/events",
    "/destinations",
    "/course-finder",
    "/contact",
    "/budget",
    "/compare",
    "/checklist",
    "/readiness",
  ];
  const supportRoutes = supportCourses.flatMap((course) =>
    courseOptions.map((option) => `/pte-ielts-support/${course.slug}/${option.slug}`),
  );

  return [
    ...[...staticRoutes, ...supportRoutes].map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: now,
      changeFrequency: (route === "" ? "weekly" : "monthly") as "weekly" | "monthly",
      priority: route === "" ? 1 : 0.8,
    })),
    ...destinations.map((destination) => ({
      url: `${baseUrl}/destinations/${destination.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
