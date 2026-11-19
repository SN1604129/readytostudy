import type { Metadata } from "next";
import { Reveal } from "@/components/motion";
import { CourseFinderQuiz } from "@/components/course-finder/quiz";
import { getCmsCourses } from "@/lib/cms-courses";
import { getCmsDestinations } from "@/lib/cms-destinations";
import { parsePreferences } from "@/lib/advisor/preferences";
import type { Preferences } from "@/lib/advisor/types";

export const metadata: Metadata = {
  title: "Course Finder",
  description:
    "Choose your destination, study level, subject and budget, then explore courses with an AI advisor and official university sources.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readOne(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CourseFinderPage({ searchParams }: { searchParams?: SearchParams }) {
  const params = searchParams ? await searchParams : {};
  const rawAnswers = {
    destination: readOne(params.destination),
    level: readOne(params.level),
    field: readOne(params.field),
    budget: readOne(params.budget),
  };
  const courses = await getCmsCourses();
  const destinations = await getCmsDestinations();
  let initialAnswers: Preferences = {};
  try { initialAnswers = parsePreferences(rawAnswers, destinations.map(d => d.slug)); }
  catch { /* Invalid URL filters start a fresh questionnaire. */ }

  return (
    <section className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6 md:pt-16">
      <Reveal>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="font-script text-2xl text-navy-600">Four questions</p>
          <h1 className="font-display text-4xl font-extrabold text-navy-950 md:text-5xl">
            Find your course
          </h1>
          <p className="mt-3 text-navy-900/75">
            Choose your preferences, explore reviewed courses, and ask our AI advisor
            to help you take the next step.
          </p>
        </div>
      </Reveal>
      <CourseFinderQuiz courses={courses} destinations={destinations} initialAnswers={initialAnswers} />
    </section>
  );
}
