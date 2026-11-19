import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CheckCircle2,
  CirclePlay,
  FileText,
  Headphones,
  MessageCircle,
  Mic,
  MousePointerClick,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import { CtaBanner } from "@/components/cta-banner";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import {
  courseOptions,
  getCourseOption,
  getSupportCourse,
  supportCourses,
  type SkillTrackSlug,
} from "@/lib/pte-ielts";

type Params = Promise<{ test: string; mode: string }>;

const skillIcons = {
  reading: BookOpen,
  writing: FileText,
  speaking: Mic,
  listening: Headphones,
} satisfies Record<SkillTrackSlug, typeof BookOpen>;

const modeIcons = {
  "demo-course": CirclePlay,
  "interactive-learning": MousePointerClick,
};

const flowIcons = [CirclePlay, Timer, Bot, BarChart3];

export async function generateStaticParams() {
  return supportCourses.flatMap((course) =>
    courseOptions.map((option) => ({ test: course.slug, mode: option.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { test, mode } = await params;
  const course = getSupportCourse(test);
  const option = getCourseOption(mode);

  if (!course || !option) {
    return { title: "PTE & IELTS Support" };
  }

  return {
    title: `${course.shortTitle} ${option.pageTitle}`,
    description: `${option.pageTitle} for ${course.shortTitle}, covering reading, writing, speaking and listening with Ready to Study.`,
  };
}

export default async function SupportModePage({ params }: { params: Params }) {
  const { test, mode } = await params;
  const course = getSupportCourse(test);
  const option = getCourseOption(mode);

  if (!course || !option) {
    notFound();
  }

  const ModeIcon = modeIcons[option.slug];
  const alternate = courseOptions.find((item) => item.slug !== option.slug);
  const flow = [
    option.slug === "demo-course" ? "Watch the guided preview" : "Start a skill task",
    "Practise with a timed prompt",
    "Review AI-assisted feedback",
    "Save next steps for coaching",
  ];

  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-10 pb-8 sm:px-6 md:pt-14">
        <Reveal>
          <Link
            href="/pte-ielts-support"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-navy-700 ring-1 ring-navy-100 transition hover:text-navy-950"
          >
            <ArrowLeft size={16} /> PTE & IELTS Support
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-gold-100 px-4 py-1.5 text-xs font-extrabold tracking-wide text-navy-900 uppercase">
              <ModeIcon size={15} aria-hidden /> {course.shortTitle} {option.title}
            </p>
            <h1 className="font-display mt-5 max-w-3xl text-4xl font-extrabold text-navy-950 md:text-5xl">
              {course.shortTitle} {option.pageTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-navy-900/75">
              {option.heroText}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {flow.map((item, index) => {
                const FlowIcon = flowIcons[index];

                return (
                  <div key={item} className="rounded-2xl bg-white p-4 ring-1 ring-navy-100">
                    <FlowIcon size={22} className="text-gold-500" aria-hidden />
                    <p className="font-display mt-3 text-sm font-extrabold text-navy-950">
                      {item}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-950 shadow-xl shadow-navy-900/15 ring-1 ring-navy-100">
            <Image
              src={course.image}
              alt={course.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-900/25 to-transparent" />
            <div className="absolute top-5 left-5 rounded-2xl bg-white/95 px-3 py-2 shadow-lg ring-1 ring-white/80">
              <Image
                src="/images/logo-mark.png"
                alt="Ready to Study Education Services"
                width={1029}
                height={689}
                className="h-10 w-auto"
              />
            </div>
            <div className="absolute right-5 bottom-5 left-5 rounded-2xl bg-white/95 p-5 shadow-xl ring-1 ring-white/80">
              <p className="text-xs font-extrabold tracking-wide text-navy-600 uppercase">
                Interactive learning preview
              </p>
              <p className="font-display mt-2 text-xl font-extrabold text-navy-950">
                Reading, Writing, Speaking, Listening
              </p>
              <p className="mt-2 text-sm leading-relaxed text-navy-900/70">
                Skill cards, timed prompts and feedback loops are grouped by the
                four test areas students practise most.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="text-sm font-extrabold tracking-wide text-navy-600 uppercase">
              Skill areas
            </p>
            <h2 className="font-display mt-2 max-w-2xl text-3xl font-extrabold text-navy-950 md:text-4xl">
              Reading, writing, speaking and listening
            </h2>
          </Reveal>

          <Stagger className="mt-9 grid gap-6 lg:grid-cols-2">
            {course.modules.map((track) => {
              const SkillIcon = skillIcons[track.slug];
              const modeDescription =
                option.slug === "demo-course" ? track.demo : track.interactive;

              return (
                <StaggerItem key={track.slug}>
                  <article className="h-full rounded-3xl bg-ice p-6 ring-1 ring-navy-100">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-navy-700 shadow-sm ring-1 ring-navy-100">
                          <SkillIcon size={24} aria-hidden />
                        </div>
                        <h3 className="font-display mt-4 text-2xl font-extrabold text-navy-950">
                          {track.title}
                        </h3>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-navy-700 ring-1 ring-navy-100">
                        {track.progress}% ready
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-navy-900/70">
                      {track.summary}
                    </p>
                    <p className="mt-3 font-semibold leading-relaxed text-navy-900">
                      {modeDescription}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {track.tasks.map((task) => (
                        <span
                          key={task}
                          className="rounded-full bg-white px-3 py-1 text-xs font-bold text-navy-900/70 ring-1 ring-navy-100"
                        >
                          {task}
                        </span>
                      ))}
                    </div>

                    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100">
                      <div className="flex items-center justify-between gap-3">
                        <p className="inline-flex items-center gap-2 text-sm font-extrabold text-navy-950">
                          <Sparkles size={17} className="text-gold-500" aria-hidden />
                          Interactive learning card
                        </p>
                        <Target size={18} className="text-navy-600" aria-hidden />
                      </div>
                      <p className="mt-4 text-sm font-semibold leading-relaxed text-navy-900">
                        {track.practicePrompt}
                      </p>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-navy-50">
                        <div
                          className="h-full rounded-full bg-gold-500"
                          style={{ width: `${track.progress}%` }}
                        />
                      </div>
                      <div className="mt-4 grid gap-3 text-xs text-navy-900/70 sm:grid-cols-2">
                        <p className="flex gap-2">
                          <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-gold-500" aria-hidden />
                          <span>{track.feedback}</span>
                        </p>
                        <p className="flex gap-2">
                          <MessageCircle size={15} className="mt-0.5 shrink-0 text-gold-500" aria-hidden />
                          <span>Save notes for your next tutor check-in.</span>
                        </p>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <Reveal>
          <div className="rounded-3xl bg-navy-950 p-7 text-white shadow-xl shadow-navy-900/15 sm:p-9 md:flex md:items-center md:justify-between md:gap-8">
            <div>
              <p className="text-sm font-extrabold tracking-wide text-gold-400 uppercase">
                Keep learning
              </p>
              <h2 className="font-display mt-2 text-2xl font-extrabold md:text-3xl">
                {alternate ? `Open ${alternate.title.toLowerCase()} next` : "Continue your prep"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy-100/80">
                Switch between preview lessons and hands-on tasks whenever you want
                to compare the learning style.
              </p>
            </div>
            {alternate && (
              <Link
                href={`/pte-ielts-support/${course.slug}/${alternate.slug}`}
                className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-gold-500 px-6 py-3 font-bold text-navy-950 shadow-lg shadow-gold-500/25 transition-transform hover:scale-105 md:mt-0"
              >
                Open {alternate.title} <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </Reveal>
      </section>

      <CtaBanner />
    </>
  );
}
