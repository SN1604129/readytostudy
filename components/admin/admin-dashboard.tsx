"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, ImagePlus, Plus, Save, Sparkles, Trash2, UploadCloud } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import type { SafeUser } from "@/lib/server-auth";
import { ContactInbox } from "@/components/admin/contact-inbox";
import { CourseManager } from "@/components/admin/course-manager";
import { AdvisorUsage } from "@/components/admin/advisor-usage";
import { EventManager } from "@/components/admin/event-manager";
import { LaunchStatus } from "@/components/admin/launch-status";
import { LogoutButton } from "@/components/auth/logout-button";

const roadmap = [
  {
    title: "Student applications CRM",
    text: "Track enquiry, documents, offer, visa and arrival status from one pipeline.",
  },
  {
    title: "Course import",
    text: "Bulk import partner universities, intakes, fees and scholarship notes from a verified spreadsheet.",
  },
  {
    title: "Document vault",
    text: "Students upload files; admins mark each item accepted, missing or needs correction.",
  },
  {
    title: "Analytics dashboard",
    text: "See popular destinations, course searches, consultation leads and incomplete forms.",
  },
  {
    title: "Smart notifications",
    text: "Email or WhatsApp reminders for missing documents, intake deadlines and appointments.",
  },
  {
    title: "Interactive eligibility score",
    text: "Students answer questions and receive a readiness score with next-best actions.",
  },
];

function blankDestination(): Destination {
  return {
    slug: `destination-${Date.now()}`,
    name: "New Destination",
    short: "ND",
    accent: "#1d3e8f",
    tagline: "Add a short destination promise.",
    intro: "Add the destination overview here.",
    perks: ["Free counselling", "Application support"],
    highlights: ["Guided application"],
    cities: ["Main city"],
    image: "",
    coords: { lat: 0, lng: 0, city: "Main city" },
  };
}

function splitLines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const inputCls = "focus-ring mt-1 w-full rounded-xl border border-navy-100 px-3 py-2 text-sm";
const labelCls = "text-xs font-extrabold tracking-[0.12em] text-navy-900/55 uppercase";

export function AdminDashboard({ user }: { user: SafeUser }) {
  const [items, setItems] = useState<Destination[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = items[selectedIndex];

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/destinations")
      .then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not load destinations."); return data; })
      .then((data) => {
        if (!alive) return;
        setItems(data.destinations ?? []);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setStatus("Could not load destinations.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const summary = useMemo(
    () => [
      { label: "Destinations", value: String(items.length) },
      { label: "Images set", value: String(items.filter((item) => item.image).length) },
      { label: "Admin", value: user.name },
    ],
    [items, user.name],
  );

  const updateSelected = (patch: Partial<Destination>) => {
    setItems((current) =>
      current.map((destination, index) =>
        index === selectedIndex ? { ...destination, ...patch } : destination,
      ),
    );
  };

  const addDestination = () => {
    setItems((current) => [...current, blankDestination()]);
    setSelectedIndex(items.length);
  };

  const deleteDestination = () => {
    if (!selected) return;
    if (!window.confirm(`Delete ${selected.name}? Save destinations to apply this deletion.`)) return;
    setItems((current) => current.filter((_, index) => index !== selectedIndex));
    setSelectedIndex((index) => Math.max(0, index - 1));
  };

  const uploadImage = async (file: File) => {
    if (!selected) return;
    setBusy(true);
    setStatus("Uploading image...");
    try {
    const form = new FormData();
    form.set("file", file);
    const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Upload failed.");
      return;
    }
    updateSelected({ image: data.url });
    setStatus("Image uploaded. Save changes to publish this destination draft.");
    } catch { setStatus("Could not upload the image. Please try again."); }
    finally { setBusy(false); }
  };

  const save = async () => {
    setBusy(true);
    setStatus("Saving...");
    try {
    const response = await fetch("/api/admin/destinations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinations: items }),
    });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error ?? "Could not save destinations.");
      return;
    }
    setItems(data.destinations);
    setStatus("Saved. Destination pages and country selectors now use your updated content.");
    } catch { setStatus("Could not save destinations. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-500 uppercase">
            Admin portal
          </p>
          <h1 className="font-display mt-2 text-4xl font-extrabold text-navy-950 md:text-5xl">
            Control the public content
          </h1>
          <p className="mt-3 max-w-2xl text-navy-900/70">
            Manage education countries, courses, events and student enquiries from one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3"><Link href="/student/history" className="font-bold text-navy-700 underline">My history</Link><LogoutButton /></div>
      </div>

      <LaunchStatus />

      <nav aria-label="Admin sections" className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-navy-700">
        <a className="focus-ring rounded-full bg-white px-4 py-2 ring-1 ring-navy-100" href="#destinations">Countries</a>
        <a className="focus-ring rounded-full bg-white px-4 py-2 ring-1 ring-navy-100" href="#events">Events & offers</a>
        <a className="focus-ring rounded-full bg-white px-4 py-2 ring-1 ring-navy-100" href="#enquiries">Enquiry inbox</a>
      </nav>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {summary.map((item) => (
          <div key={item.label} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy-100">
            <p className="text-xs font-extrabold tracking-[0.16em] text-navy-900/45 uppercase">{item.label}</p>
            <p className="font-display mt-2 text-3xl font-extrabold text-navy-700">{item.value}</p>
          </div>
        ))}
      </div>

      <div id="destinations" className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-2xl font-extrabold text-navy-950">Destinations</h2>
            <button
              type="button"
              onClick={addDestination}
              disabled={busy || loading}
              className="focus-ring inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-extrabold text-navy-950"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="mt-5 space-y-2">
            {loading && <p className="text-sm text-navy-900/60">Loading destinations...</p>}
            {!loading && items.length === 0 && (
              <p className="rounded-2xl bg-navy-50 p-4 text-sm text-navy-900/65">No destinations yet.</p>
            )}
            {items.map((destination, index) => (
              <button
                key={`${destination.slug}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                disabled={busy}
                className={`focus-ring flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left ${
                  selectedIndex === index ? "bg-navy-700 text-white" : "bg-navy-50 text-navy-900"
                }`}
              >
                <span>
                  <span className="font-display block font-extrabold">{destination.name}</span>
                  <span className="block text-xs opacity-70">{destination.slug}</span>
                </span>
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-extrabold text-white"
                  style={{ backgroundColor: destination.accent }}
                >
                  {destination.short}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-navy-100">
          {!selected ? (
            <div className="grid min-h-80 place-items-center rounded-2xl bg-navy-50 p-8 text-center text-navy-900/65">
              Select or add a destination.
            </div>
          ) : (
            <div className="grid gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-2xl font-extrabold text-navy-950">
                  Edit {selected.name}
                </h2>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={deleteDestination}
                    disabled={busy}
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-extrabold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={busy || loading}
                    className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-4 py-2 text-sm font-extrabold text-white"
                  >
                    <Save size={16} /> Save
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label>
                  <span className={labelCls}>Name</span>
                  <input className={inputCls} value={selected.name} onChange={(e) => updateSelected({ name: e.target.value })} />
                </label>
                <label>
                  <span className={labelCls}>Slug</span>
                  <input className={inputCls} value={selected.slug} onChange={(e) => updateSelected({ slug: e.target.value })} />
                </label>
                <label>
                  <span className={labelCls}>Short code</span>
                  <input className={inputCls} value={selected.short} onChange={(e) => updateSelected({ short: e.target.value })} />
                </label>
                <label>
                  <span className={labelCls}>Accent color</span>
                  <input className={inputCls} value={selected.accent} onChange={(e) => updateSelected({ accent: e.target.value })} />
                </label>
                <label className="md:col-span-2">
                  <span className={labelCls}>Tagline</span>
                  <input className={inputCls} value={selected.tagline} onChange={(e) => updateSelected({ tagline: e.target.value })} />
                </label>
                <label className="md:col-span-2">
                  <span className={labelCls}>Intro</span>
                  <textarea className={`${inputCls} min-h-24`} value={selected.intro} onChange={(e) => updateSelected({ intro: e.target.value })} />
                </label>
                <label>
                  <span className={labelCls}>Badge</span>
                  <input className={inputCls} value={selected.badge ?? ""} onChange={(e) => updateSelected({ badge: e.target.value })} />
                </label>
                <label>
                  <span className={labelCls}>Main city</span>
                  <input
                    className={inputCls}
                    value={selected.coords.city}
                    onChange={(e) => updateSelected({ coords: { ...selected.coords, city: e.target.value } })}
                  />
                </label>
                <label>
                  <span className={labelCls}>Latitude</span>
                  <input
                    className={inputCls}
                    type="number"
                    step="0.01"
                    value={selected.coords.lat}
                    onChange={(e) => updateSelected({ coords: { ...selected.coords, lat: Number(e.target.value) } })}
                  />
                </label>
                <label>
                  <span className={labelCls}>Longitude</span>
                  <input
                    className={inputCls}
                    type="number"
                    step="0.01"
                    value={selected.coords.lng}
                    onChange={(e) => updateSelected({ coords: { ...selected.coords, lng: Number(e.target.value) } })}
                  />
                </label>
                <label className="md:col-span-2">
                  <span className={labelCls}>Cities</span>
                  <textarea className={`${inputCls} min-h-20`} value={selected.cities.join("\n")} onChange={(e) => updateSelected({ cities: splitLines(e.target.value) })} />
                </label>
                <label className="md:col-span-2">
                  <span className={labelCls}>Perks</span>
                  <textarea className={`${inputCls} min-h-24`} value={selected.perks.join("\n")} onChange={(e) => updateSelected({ perks: splitLines(e.target.value) })} />
                </label>
                <label className="md:col-span-2">
                  <span className={labelCls}>Highlights</span>
                  <textarea className={`${inputCls} min-h-24`} value={selected.highlights.join("\n")} onChange={(e) => updateSelected({ highlights: splitLines(e.target.value) })} />
                </label>
              </div>

              <div className="rounded-2xl bg-navy-50 p-4">
                <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
                  <div
                    className={`grid min-h-44 place-items-center rounded-2xl bg-white bg-center text-center text-sm font-semibold text-navy-900/55 ring-1 ring-navy-100 ${selected.imageFit === "contain" ? "bg-contain bg-no-repeat" : "bg-cover"}`}
                    style={selected.image ? { backgroundImage: `url(${selected.image})` } : undefined}
                  >
                    {!selected.image && (
                      <span className="flex flex-col items-center gap-2">
                        <ImagePlus size={26} /> No image
                      </span>
                    )}
                  </div>
                  <div>
                    <label>
                      <span className={labelCls}>Image URL</span>
                      <input className={inputCls} value={selected.image ?? ""} onChange={(e) => updateSelected({ image: e.target.value })} />
                    </label>
                    <label className="mt-3 block">
                      <span className={labelCls}>Image display</span>
                      <select className={inputCls} value={selected.imageFit ?? "cover"} onChange={(e) => updateSelected({ imageFit: e.target.value === "contain" ? "contain" : "cover" })}>
                        <option value="cover">Fill image area</option>
                        <option value="contain">Show full poster</option>
                      </select>
                    </label>
                    <label className="focus-ring mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-navy-700 ring-1 ring-navy-100 hover:bg-navy-50">
                      <UploadCloud size={16} /> Upload image
                      <input
                        type="file"
                        disabled={busy}
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          if (file) void uploadImage(file);
                        }}
                      />
                    </label>
                    <p className="mt-3 text-xs leading-relaxed text-navy-900/55">
                      Upload JPG, PNG, WebP or GIF images under 4 MB. Save changes after uploading.
                    </p>
                  </div>
                </div>
              </div>

              {status && <p className="rounded-2xl bg-gold-100 px-4 py-3 text-sm font-semibold text-navy-900">{status}</p>}
            </div>
          )}
        </div>
      </div>

      <CourseManager destinations={items} />
      <EventManager />
      <AdvisorUsage />
      <ContactInbox />

      <section className="mt-12 rounded-3xl bg-navy-950 p-6 text-white md:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.7rem] font-bold tracking-[0.22em] text-gold-400 uppercase">
              Feature analysis
            </p>
            <h2 className="font-display mt-2 text-3xl font-extrabold">How to make the platform more interactive</h2>
          </div>
          <Link
            href="/student"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-navy-950"
          >
            <Sparkles size={16} /> View student side
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roadmap.map((item) => (
            <article key={item.title} className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/10">
              <BarChart3 className="text-gold-400" size={22} aria-hidden />
              <h3 className="font-display mt-3 text-lg font-extrabold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-100/75">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
