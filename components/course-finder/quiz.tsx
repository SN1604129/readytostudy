"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Save, Sparkles } from "lucide-react";
import { budgets, fields, levels, type Course } from "@/lib/courses";
import { exactMatches } from "@/lib/advisor/preferences";
import { AdvisorPanel } from "@/components/chat/advisor-panel";
import { useAdvisor } from "@/components/chat/advisor-provider";
import type { Destination } from "@/lib/destinations";
import { useJourney } from "@/lib/journey";
import { BoardingPass } from "@/components/travel/boarding-pass";

type Answers = { destination?: string; level?: string; field?: string; budget?: string };

function stepsFor(destinations: Destination[]) {
  return [
    { key: "destination", title: "Where do you want to study?", options: destinations.map((d) => ({ id: d.slug, label: d.name, hint: d.badge })) },
    { key: "level", title: "What level are you applying for?", options: levels.map((l) => ({ id: l.id, label: l.label, hint: undefined as string | undefined })) },
    { key: "field", title: "What do you want to study?", options: fields.map((f) => ({ id: f.id, label: f.label, hint: undefined as string | undefined })) },
    { key: "budget", title: "What's your budget comfort?", options: budgets.map((b) => ({ id: b.id, label: b.label, hint: b.hint })) },
  ] as const;
}

function initialStep(answers: Answers, steps: ReturnType<typeof stepsFor>) {
  const firstMissing = steps.findIndex((s) => !answers[s.key]);
  return firstMissing === -1 ? steps.length : firstMissing;
}

export function CourseFinderQuiz({
  courses,
  destinations,
  initialAnswers = {},
}: {
  courses: Course[];
  destinations: Destination[];
  initialAnswers?: Answers;
}) {
  const steps = useMemo(() => stepsFor(destinations), [destinations]);
  const [step, setStep] = useState(initialStep(initialAnswers, steps));
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const { journey, update, saveCourse, accountLoading } = useJourney();
  const advisor = useAdvisor();
  const reduce = useReducedMotion();
  const done = step >= steps.length;

  const activeAnswers = done ? advisor.preferences : answers;
  const results = useMemo(() => (done ? exactMatches(courses.filter(c => c.verified), activeAnswers) : []), [done, courses, activeAnswers]);
  const { setPreferences } = advisor;
  useEffect(() => {
    if (!accountLoading && Object.values(initialAnswers).some(Boolean)) setPreferences(initialAnswers);
  }, [initialAnswers, setPreferences, accountLoading]);

  const pick = (key: string, id: string) => {
    setAnswers((a) => ({ ...a, [key]: id }));
    if (key === "destination") update({ destination: id });
    if (key === "level") update({ level: id as typeof journey.level });
    if (key === "field") update({ field: id });
    if (key === "budget") update({ budget: id as typeof journey.budget });
    setStep((s) => s + 1);
  };

  const progress = Math.min(step / steps.length, 1);

  return (
    <div className={`mx-auto ${done ? "max-w-6xl" : "max-w-3xl"}`}>
      {/* Progress */}
      <div className="mb-8 flex items-center gap-4" aria-hidden>
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-100">
          <motion.div
            className="h-full rounded-full bg-gold-500"
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: reduce ? 0 : 0.4, ease: "easeOut" }}
          />
        </div>
        <span className="font-display text-sm font-bold text-navy-700">
          {Math.min(step + 1, steps.length)}/{steps.length}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!done ? (
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -32 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <h2 className="font-display text-2xl font-extrabold text-navy-950 md:text-3xl">
              {steps[step].title}
            </h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {steps[step].options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => pick(steps[step].key, o.id)}
                  className="focus-ring group rounded-2xl border-2 border-navy-100 bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-navy-700 hover:shadow-lg"
                >
                  <span className="font-display block font-bold text-navy-900 group-hover:text-navy-700">
                    {o.label}
                  </span>
                  {o.hint && (
                    <span className="mt-1 block text-xs font-semibold text-badge-red uppercase">{o.hint}</span>
                  )}
                </button>
              ))}
            </div>
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="focus-ring mt-6 inline-flex items-center gap-1.5 font-semibold text-navy-700 hover:underline"
              >
                <ArrowLeft size={16} /> Back
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="results"
            className="grid items-start gap-8 lg:grid-cols-[1fr_1fr]"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold text-gold-500">
              <Sparkles size={18} /> Your matches
            </p>
            <h2 className="font-display mt-1 text-2xl font-extrabold text-navy-950 md:text-3xl">
              Courses worth a conversation
            </h2>
            <div className="mt-6 space-y-4">
              {results.length === 0 && (
                <p className="rounded-2xl bg-white p-6 text-navy-900/75 ring-1 ring-navy-100">
                  No reviewed course in our catalogue matches all your selections yet. Search official university pages with the advisor, adjust your preferences, or{" "}
                  <Link href="/contact" className="font-bold text-navy-700 underline">
                    Ask us directly
                  </Link>
                  . Our counselling is free.
                </p>
              )}
              {results.map(({ course, scorePercent, reasons }, i) => {
                const destination = destinations.find((d) => d.slug === course.destination);
                const saved = journey.savedCourses.some((c) => c.title === course.title);
                return (
                <motion.article
                  key={course.title + course.university}
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : 0.15 + i * 0.12 }}
                >
                  <BoardingPass
                    to={destination?.short ?? "STUDY"}
                    title={course.title}
                    subtitle={`${course.university} · ${destination?.name ?? course.destination}`}
                    status={`${scorePercent}% match`}
                    fields={[
                      { label: "Level", value: levels.find((l) => l.id === course.level)?.label ?? course.level },
                      { label: "Budget", value: budgets.find((b) => b.id === course.budget)?.label ?? course.budget },
                      { label: "Why", value: reasons.slice(0, 2).join(", ") || "near match" },
                    ]}
                    footer={
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            saveCourse({
                              title: course.title,
                              university: course.university,
                              destination: course.destination,
                            })
                          }
                          className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-5 py-2.5 text-sm font-bold text-white"
                        >
                          <Save size={16} /> {saved ? "Saved" : "Save course"}
                        </button>
                        <Link href="/compare" className="focus-ring text-sm font-bold text-navy-700 hover:underline">
                          Compare destinations
                        </Link>
                        <button type="button" onClick={() => advisor.askAbout(course.title)} className="focus-ring text-sm font-bold text-navy-700 underline">Ask about this course</button>
                      </div>
                    }
                  >
                    {course.note && (
                      <p className="text-xs font-bold tracking-wide text-badge-red uppercase">
                        {course.note}
                      </p>
                    )}
                    <p className="mt-2 text-sm text-navy-900/65">
                      Match score weighs destination, level, field and budget. A counsellor confirms current intakes and entry rules.
                    </p>
                  </BoardingPass>
                </motion.article>
              );
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-6 py-3 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105"
              >
                Discuss these free <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setStep(0);
                  update({ destination: undefined, level: undefined, field: undefined, budget: undefined });
                }}
                className="focus-ring inline-flex items-center gap-2 rounded-full border-2 border-navy-700/25 px-6 py-3 font-bold text-navy-700 hover:border-navy-700/50"
              >
                <RotateCcw size={16} /> Start over
              </button>
            </div>
            <p className="mt-6 text-xs text-navy-900/60">
              Matches come from the managed course list — your counsellor will confirm
              current intakes, entry requirements and scholarships.
            </p>
            </div>
            <div className="min-w-0 lg:sticky lg:top-24"><AdvisorPanel /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <div className="mt-14 overflow-hidden rounded-3xl">
          <Image
            src="/images/study-desk-planning.png"
            alt=""
            aria-hidden
            width={1402}
            height={1122}
            className="max-h-56 w-full object-cover opacity-90"
          />
        </div>
      )}
    </div>
  );
}
