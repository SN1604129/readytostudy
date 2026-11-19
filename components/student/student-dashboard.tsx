"use client";

import Link from "next/link";
import { BookOpen, BookOpenCheck, ClipboardCheck, FileText, Gauge, WalletCards } from "lucide-react";
import type { SafeUser } from "@/lib/server-auth";
import { destinations as defaults, type Destination } from "@/lib/destinations";
import { readinessSteps, useJourney } from "@/lib/journey";
import { CountUp } from "@/components/count-up";
import { LogoutButton } from "@/components/auth/logout-button";

const actions = [
  { href: "/course-finder", label: "Find courses", icon: BookOpen },
  { href: "/budget", label: "Budget calculator", icon: WalletCards },
  { href: "/checklist", label: "Document checklist", icon: FileText },
  { href: "/readiness", label: "Readiness dashboard", icon: Gauge },
];

export function StudentDashboard({ user, destinations = defaults }: { user: SafeUser; destinations?: Destination[] }) {
  const { journey } = useJourney();
  const destination = destinations.find((item) => item.slug === journey.destination);
  const completed = readinessSteps.filter((step) => step.done(journey)).length;
  const percent = Math.round((completed / readinessSteps.length) * 100);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
            Student portal
          </p>
          <h1 className="font-display mt-2 text-4xl font-extrabold text-navy-950 md:text-5xl">
            Welcome, {user.name}
          </h1>
          <p className="mt-3 max-w-2xl text-navy-900/70">
            Your saved courses, document checklist and planning tools live here.
          </p>
        </div>
        <LogoutButton />
      </div>

      <Link href="/student/history" className="focus-ring mt-6 inline-flex rounded-full bg-navy-700 px-5 py-3 text-sm font-bold text-white">My history — enquiries, chats and activity</Link>

      <div className="mt-8 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl bg-navy-950 p-6 text-white shadow-xl shadow-navy-900/15">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.7rem] font-bold tracking-[0.2em] text-gold-400 uppercase">
                Readiness
              </p>
              <p className="font-display mt-3 text-6xl font-extrabold">
                <CountUp to={percent} suffix="%" />
              </p>
            </div>
            <BookOpenCheck className="text-gold-400" size={34} aria-hidden />
          </div>
          <div className="mt-5 h-3 rounded-full bg-white/15">
            <div className="h-full rounded-full bg-gold-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-4 text-sm text-navy-100/70">
            {completed}/{readinessSteps.length} readiness steps complete.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
            <p className="text-xs font-extrabold tracking-[0.16em] text-navy-900/45 uppercase">
              Destination
            </p>
            <p className="font-display mt-2 text-3xl font-extrabold text-navy-700">
              {destination?.name ?? "Not chosen"}
            </p>
            <Link href="/destinations" className="mt-4 inline-flex text-sm font-bold text-navy-700 hover:underline">
              Compare destinations
            </Link>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
            <p className="text-xs font-extrabold tracking-[0.16em] text-navy-900/45 uppercase">
              Saved courses
            </p>
            <p className="font-display mt-2 text-3xl font-extrabold text-navy-700">
              <CountUp to={journey.savedCourses.length} />
            </p>
            <Link href="/course-finder" className="mt-4 inline-flex text-sm font-bold text-navy-700 hover:underline">
              Open Course Finder
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="focus-ring group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-navy-900/10"
          >
            <action.icon className="text-gold-500" size={26} aria-hidden />
            <h2 className="font-display mt-4 font-extrabold text-navy-950 group-hover:text-navy-700">
              {action.label}
            </h2>
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
        <div className="flex items-center gap-3">
          <ClipboardCheck className="text-gold-500" size={24} aria-hidden />
          <h2 className="font-display text-2xl font-extrabold text-navy-950">Next best steps</h2>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {readinessSteps.map((step) => {
            const done = step.done(journey);
            return (
              <Link
                key={step.id}
                href={step.href}
                className={`focus-ring rounded-2xl px-4 py-3 text-sm font-bold ${
                  done ? "bg-green-50 text-green-800" : "bg-navy-50 text-navy-800 hover:bg-navy-100"
                }`}
              >
                {done ? "Done: " : "Start: "}
                {step.label}
              </Link>
            );
          })}
        </div>
      </section>
    </section>
  );
}
