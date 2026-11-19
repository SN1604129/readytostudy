import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  CirclePlay,
  Headphones,
  Mic,
  MousePointerClick,
  PenLine,
} from "lucide-react";
import { CtaBanner } from "@/components/cta-banner";
import { Reveal, Stagger, StaggerItem } from "@/components/motion";
import { courseOptions, supportCourses } from "@/lib/pte-ielts";

export const metadata: Metadata = {
  title: "PTE & IELTS Support",
  description:
    "AI-assisted PTE and IELTS preparation support from Ready to Study, with focused practice for speaking, writing, reading and listening.",
};

const courseIcons = {
  pte: Mic,
  ielts: PenLine,
};

const optionIcons = {
  "demo-course": CirclePlay,
  "interactive-learning": MousePointerClick,
};

const supportModes = [
  { icon: BrainCircuit, title: "AI-assisted feedback", text: "Use faster practice loops for speaking, writing and test-task review." },
  { icon: Headphones, title: "Human coaching", text: "Work with counsellors who connect test prep to your study abroad plan." },
  { icon: CheckCircle2, title: "Application ready", text: "Match your target score with admission, scholarship and visa timelines." },
];

export default function PteIeltsSupportPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-8 sm:px-6 md:pt-16">
        <Reveal>
          <p className="text-sm font-extrabold tracking-wide text-navy-600 uppercase">
            AI-assisted courses
          </p>
          <h1 className="font-display max-w-3xl text-4xl font-extrabold text-navy-950 md:text-5xl">
            PTE & IELTS Support
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-900/75">
            AI-assisted preparation for the English score you need, connected to
            your course, university and visa plan from day one.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <Stagger className="grid gap-6 lg:grid-cols-2">
          {supportCourses.map((course, index) => {
            const CourseIcon = courseIcons[course.slug];

            return (
            <StaggerItem key={course.title}>
              <article className="group h-full overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-navy-100 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10">
                <div className="relative aspect-[3/2] overflow-hidden">
                  <Image
                    src={course.image}
                    alt={course.imageAlt}
                    fill
                    priority={index === 0}
                    sizes="(min-width: 1024px) 560px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-navy-950/80 via-navy-900/35 to-transparent" />
                  <div className="absolute top-4 left-4 inline-flex rounded-2xl bg-white/95 px-3 py-2 shadow-lg ring-1 ring-white/80">
                    <Image
                      src="/images/logo-mark.png"
                      alt="Ready to Study Education Services"
                      width={1029}
                      height={689}
                      className="h-10 w-auto"
                    />
                  </div>
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-3.5 py-1.5 text-xs font-extrabold tracking-wide text-navy-950 uppercase">
                      <CourseIcon size={15} aria-hidden /> {course.label}
                    </span>
                    <h2 className="font-display mt-3 max-w-md text-2xl font-extrabold text-white md:text-3xl">
                      {course.title}
                    </h2>
                  </div>
                </div>

                <div className="p-7">
                  <p className="leading-relaxed text-navy-900/75">{course.intro}</p>
                  <ul className="mt-5 space-y-3 text-sm leading-relaxed text-navy-900/75">
                    {course.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-gold-500" aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {courseOptions.map((option) => (
                      (() => {
                        const OptionIcon = optionIcons[option.slug];

                        return (
                          <Link
                            key={option.slug}
                            href={`/pte-ielts-support/${course.slug}/${option.slug}`}
                            className="focus-ring group/option flex min-h-[8rem] flex-col justify-between rounded-2xl border border-navy-100 bg-ice p-4 transition hover:-translate-y-0.5 hover:border-gold-500 hover:bg-white hover:shadow-lg hover:shadow-navy-900/10"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-navy-700 ring-1 ring-navy-100 transition group-hover/option:bg-gold-500 group-hover/option:text-navy-950">
                              <OptionIcon size={20} aria-hidden />
                            </span>
                            <span>
                              <span className="font-display block text-base font-extrabold text-navy-950">
                                {option.title}
                              </span>
                              <span className="mt-1 block text-xs leading-relaxed text-navy-900/65">
                                {option.text}
                              </span>
                            </span>
                          </Link>
                        );
                      })()
                    ))}
                  </div>
                </div>
              </article>
            </StaggerItem>
            );
          })}
        </Stagger>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <p className="font-script text-2xl text-navy-600">Course support</p>
            <h2 className="font-display max-w-2xl text-3xl font-extrabold text-navy-950 md:text-4xl">
              Prep that fits your admission timeline
            </h2>
          </Reveal>
          <Stagger className="mt-9 grid gap-5 md:grid-cols-3">
            {supportModes.map((mode) => (
              <StaggerItem key={mode.title}>
                <div className="h-full rounded-2xl bg-ice p-6 ring-1 ring-navy-100">
                  <mode.icon size={28} className="text-gold-500" aria-hidden />
                  <h3 className="font-display mt-4 text-lg font-bold text-navy-950">{mode.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-900/70">{mode.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal delay={0.1}>
            <Link
              href="/contact"
              className="focus-ring mt-9 inline-flex items-center gap-2 rounded-full bg-navy-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105"
            >
              Start test preparation <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
