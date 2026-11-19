"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, Plus, Save, Trash2 } from "lucide-react";
import { budgets, fields, levels, studyModes, type Course } from "@/lib/courses";
import { destinations as fallbackDestinations, type Destination } from "@/lib/destinations";

const inputCls = "focus-ring mt-1 w-full rounded-xl border border-navy-100 px-3 py-2 text-sm";
const labelCls = "text-xs font-extrabold tracking-[0.12em] text-navy-900/55 uppercase";

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function blankCourse(destination = "australia"): Course {
  return {
    title: "New course",
    university: "University name",
    destination,
    level: "bachelors",
    fields: ["business"],
    budget: "medium",
    city: "",
    campus: "",
    studyMode: "on-campus",
    duration: "",
    nextIntake: "",
    intakes: [],
    currency: "AUD",
    tuitionPerYear: undefined,
    ieltsScore: undefined,
    hasScholarship: false,
    hasInternship: false,
    summary: "",
    note: "",
  };
}

export function CourseManager({ destinations }: { destinations: Destination[] }) {
  const destinationOptions = useMemo(
    () => (destinations.length > 0 ? destinations : fallbackDestinations),
    [destinations],
  );
  const [items, setItems] = useState<Course[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const selected = items[selectedIndex];

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/courses")
      .then((response) => response.json())
      .then((data) => {
        if (!alive) return;
        setItems(data.courses ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setStatus("Could not load courses.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const updateSelected = (patch: Partial<Course>) => {
    setItems((current) =>
      current.map((course, index) => (index === selectedIndex ? { ...course, ...patch } : course)),
    );
  };

  const addCourse = () => {
    setItems((current) => {
      const next = [...current, blankCourse(destinationOptions[0]?.slug)];
      setSelectedIndex(next.length - 1);
      return next;
    });
  };

  const deleteCourse = () => {
    if (!selected) return;
    setItems((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex((index) => Math.max(0, index - 1));
  };

  const toggleField = (fieldId: string) => {
    if (!selected) return;
    updateSelected({
      fields: selected.fields.includes(fieldId)
        ? selected.fields.filter((field) => field !== fieldId)
        : [...selected.fields, fieldId],
    });
  };

  const save = async () => {
    setStatus("Saving courses...");
    const response = await fetch("/api/admin/courses", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courses: items }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Could not save courses.");
      return;
    }
    setItems(data.courses);
    setStatus("Saved. Course Finder and Courses page now use this course list.");
  };

  return (
    <section className="mt-12 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy-100">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.7rem] font-bold tracking-[0.18em] text-gold-500 uppercase">
              Course CMS
            </p>
            <h2 className="font-display mt-1 text-2xl font-extrabold text-navy-950">Courses</h2>
          </div>
          <button
            type="button"
            onClick={addCourse}
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-extrabold text-navy-950"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        <div className="mt-5 space-y-2">
          {loading && <p className="text-sm text-navy-900/60">Loading courses...</p>}
          {!loading && items.length === 0 && (
            <p className="rounded-2xl bg-navy-50 p-4 text-sm text-navy-900/65">No courses yet.</p>
          )}
          {items.map((course, index) => {
            const destination = destinationOptions.find((item) => item.slug === course.destination);
            return (
              <button
                key={`${course.title}-${course.university}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`focus-ring flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${
                  selectedIndex === index ? "bg-navy-700 text-white" : "bg-navy-50 text-navy-900"
                }`}
              >
                <BookOpenCheck size={18} className="shrink-0 opacity-80" aria-hidden />
                <span className="min-w-0">
                  <span className="font-display block truncate font-extrabold">{course.title}</span>
                  <span className="block truncate text-xs opacity-70">
                    {course.university} · {course.city || destination?.name || course.destination}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy-100">
        {!selected ? (
          <div className="grid min-h-80 place-items-center rounded-2xl bg-navy-50 p-8 text-center text-navy-900/65">
            Select or add a course.
          </div>
        ) : (
          <div className="grid gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-extrabold text-navy-950">
                Edit {selected.title}
              </h2>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={deleteCourse}
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
                <button
                  type="button"
                  onClick={save}
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-4 py-2 text-sm font-extrabold text-white"
                >
                  <Save size={16} /> Save
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="flex items-start gap-3 rounded-2xl bg-ice p-4 md:col-span-2">
                <input type="checkbox" checked={selected.verified === true} onChange={e => updateSelected({ verified: e.target.checked })} className="mt-1 h-4 w-4" />
                <span className="text-sm text-navy-800"><strong>Reviewed and ready to recommend</strong><span className="mt-1 block text-xs">Check the university, course, fees and intake before enabling. Only reviewed entries appear in the course finder and AI recommendations.</span></span>
              </label>
              <label className="md:col-span-2"><span className={labelCls}>Official course URL</span><input type="url" value={selected.sourceUrl || ""} onChange={e => updateSelected({ sourceUrl: e.target.value })} placeholder="https://university.edu/course" className={inputCls} /></label>
              <label className="md:col-span-2">
                <span className={labelCls}>Course title</span>
                <input
                  className={inputCls}
                  value={selected.title}
                  onChange={(event) => updateSelected({ title: event.target.value })}
                />
              </label>
              <label className="md:col-span-2">
                <span className={labelCls}>University / provider</span>
                <input
                  className={inputCls}
                  value={selected.university}
                  onChange={(event) => updateSelected({ university: event.target.value })}
                />
              </label>
              <label>
                <span className={labelCls}>Destination</span>
                <select
                  className={inputCls}
                  value={selected.destination}
                  onChange={(event) => updateSelected({ destination: event.target.value })}
                >
                  {destinationOptions.map((destination) => (
                    <option key={destination.slug} value={destination.slug}>
                      {destination.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelCls}>Level</span>
                <select
                  className={inputCls}
                  value={selected.level}
                  onChange={(event) => updateSelected({ level: event.target.value as Course["level"] })}
                >
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelCls}>Budget band</span>
                <select
                  className={inputCls}
                  value={selected.budget}
                  onChange={(event) => updateSelected({ budget: event.target.value as Course["budget"] })}
                >
                  {budgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {budget.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelCls}>Study mode</span>
                <select
                  className={inputCls}
                  value={selected.studyMode ?? "on-campus"}
                  onChange={(event) => updateSelected({ studyMode: event.target.value as Course["studyMode"] })}
                >
                  {studyModes.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={labelCls}>City</span>
                <input
                  className={inputCls}
                  value={selected.city ?? ""}
                  onChange={(event) => updateSelected({ city: event.target.value })}
                  placeholder="e.g. Sydney"
                />
              </label>
              <label>
                <span className={labelCls}>Campus</span>
                <input
                  className={inputCls}
                  value={selected.campus ?? ""}
                  onChange={(event) => updateSelected({ campus: event.target.value })}
                  placeholder="e.g. Kensington"
                />
              </label>
              <label>
                <span className={labelCls}>Duration</span>
                <input
                  className={inputCls}
                  value={selected.duration ?? ""}
                  onChange={(event) => updateSelected({ duration: event.target.value })}
                  placeholder="e.g. 2 Years"
                />
              </label>
              <label>
                <span className={labelCls}>Next intake</span>
                <input
                  className={inputCls}
                  value={selected.nextIntake ?? ""}
                  onChange={(event) => updateSelected({ nextIntake: event.target.value })}
                  placeholder="e.g. Sep 2026"
                />
              </label>
              <label>
                <span className={labelCls}>Currency</span>
                <input
                  className={inputCls}
                  value={selected.currency ?? ""}
                  onChange={(event) => updateSelected({ currency: event.target.value.toUpperCase() })}
                  placeholder="AUD"
                />
              </label>
              <label>
                <span className={labelCls}>Tuition / year</span>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  value={selected.tuitionPerYear ?? ""}
                  onChange={(event) =>
                    updateSelected({
                      tuitionPerYear: event.target.value === "" ? undefined : Number(event.target.value),
                    })
                  }
                  placeholder="e.g. 32000"
                />
              </label>
              <label>
                <span className={labelCls}>IELTS score</span>
                <input
                  className={inputCls}
                  type="number"
                  min={0}
                  max={9}
                  step={0.5}
                  value={selected.ieltsScore ?? ""}
                  onChange={(event) =>
                    updateSelected({
                      ieltsScore: event.target.value === "" ? undefined : Number(event.target.value),
                    })
                  }
                  placeholder="e.g. 6.5"
                />
              </label>
              <label className="md:col-span-2">
                <span className={labelCls}>All intakes</span>
                <textarea
                  className={`${inputCls} min-h-20`}
                  value={(selected.intakes ?? []).join("\n")}
                  onChange={(event) => updateSelected({ intakes: splitLines(event.target.value) })}
                  placeholder="14.09.2026 - Sydney&#10;08.02.2027 - Sydney"
                />
              </label>
              <label className="md:col-span-2">
                <span className={labelCls}>Short summary</span>
                <textarea
                  className={`${inputCls} min-h-20`}
                  value={selected.summary ?? ""}
                  onChange={(event) => updateSelected({ summary: event.target.value })}
                />
              </label>
              <label className="md:col-span-2">
                <span className={labelCls}>Note / scholarship line</span>
                <textarea
                  className={`${inputCls} min-h-20`}
                  value={selected.note ?? ""}
                  onChange={(event) => updateSelected({ note: event.target.value })}
                />
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-ice px-4 py-3 text-sm font-semibold text-navy-900">
                <input
                  type="checkbox"
                  checked={Boolean(selected.hasScholarship)}
                  onChange={(event) => updateSelected({ hasScholarship: event.target.checked })}
                  className="h-4 w-4 accent-navy-700"
                />
                Scholarship available
              </label>
              <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-ice px-4 py-3 text-sm font-semibold text-navy-900">
                <input
                  type="checkbox"
                  checked={Boolean(selected.hasInternship)}
                  onChange={(event) => updateSelected({ hasInternship: event.target.checked })}
                  className="h-4 w-4 accent-navy-700"
                />
                Internship available
              </label>
            </div>

            <div>
              <p className={labelCls}>Fields</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {fields.map((field) => (
                  <label
                    key={field.id}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl bg-ice px-4 py-3 text-sm font-semibold text-navy-900"
                  >
                    <input
                      type="checkbox"
                      checked={selected.fields.includes(field.id)}
                      onChange={() => toggleField(field.id)}
                      className="h-4 w-4 accent-navy-700"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>

            {status && <p className="rounded-2xl bg-gold-100 px-4 py-3 text-sm font-semibold text-navy-900">{status}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
