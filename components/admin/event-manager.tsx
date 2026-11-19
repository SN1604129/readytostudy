"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2, UploadCloud } from "lucide-react";
import type { CmsEvent } from "@/lib/cms-events";

const input = "focus-ring mt-1 w-full rounded-xl border border-navy-100 bg-white px-3 py-2 text-sm";
const label = "text-xs font-bold text-navy-900/65";

export function EventManager() {
  const [items, setItems] = useState<CmsEvent[]>([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(true);
  const selected = items[index];
  useEffect(() => {
    let alive = true;
    fetch("/api/admin/events").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load events.");
      if (alive) setItems(data.events);
    }).catch(error => { if (alive) setStatus(error.message); }).finally(() => { if (alive) setBusy(false); });
    return () => { alive = false; };
  }, []);
  const update = (patch: Partial<CmsEvent>) => setItems(current => current.map((event, i) => i === index ? { ...event, ...patch } : event));
  async function save() {
    setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/admin/events", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events: items }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save events.");
      setItems(data.events); setStatus("Saved. Active, reviewed events now appear on the Events page.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Could not save events."); }
    finally { setBusy(false); }
  }
  async function upload(file: File) {
    setBusy(true); setStatus("Uploading...");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/uploads", { method: "POST", body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      update({ images: [{ src: data.url, alt: selected.name }] });
      setStatus("Image uploaded. Save events to publish the change.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); }
  }
  return <section id="events" className="mt-12 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100 md:p-8">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="font-display text-2xl font-extrabold text-navy-950">Events & offers</h2><p className="mt-2 text-sm text-navy-900/65">Create drafts, upload posters, and publish reviewed events.</p></div>
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={() => { setItems(current => [...current, { slug: `event-${Date.now()}`, name: "New event", kind: "seminar", summary: "Add your event details.", images: [], verified: false, active: true, lastUpdated: "", status: "draft" }]); setIndex(items.length); }} className="focus-ring inline-flex items-center gap-2 rounded-full bg-gold-500 px-4 py-2 text-sm font-bold text-navy-950 disabled:opacity-50"><Plus size={16} /> Add event</button>
        <button type="button" disabled={busy} onClick={() => void save()} className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"><Save size={16} /> Save events</button>
      </div>
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-[0.65fr_1.35fr]">
      <div className="space-y-2">{items.map((event, i) => <button disabled={busy} key={i} type="button" onClick={() => setIndex(i)} className={`focus-ring block w-full rounded-xl p-3 text-left text-sm ${i === index ? "bg-navy-700 text-white" : "bg-ice text-navy-900"}`}><span className="block font-bold">{event.name}</span><span className="text-xs opacity-70">{event.status} · {event.verified ? "reviewed" : "unreviewed"}</span></button>)}</div>
      {selected ? <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
        <label className={label}>Event name<input className={input} value={selected.name} onChange={e => update({ name: e.target.value })} /></label>
        <label className={label}>Event slug<input className={input} value={selected.slug} onChange={e => update({ slug: e.target.value })} /></label>
        <label className={label}>Type<select className={input} value={selected.kind} onChange={e => update({ kind: e.target.value as CmsEvent["kind"] })}>{["seminar", "webinar", "conference", "promotion"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label className={label}>Publication status<select className={input} value={selected.status} onChange={e => update({ status: e.target.value as CmsEvent["status"] })}>{["draft", "upcoming", "past", "offer"].map(v => <option key={v}>{v}</option>)}</select></label>
        <label className={label}>Date, time & timezone<input className={input} value={selected.date ?? ""} placeholder="e.g. 15 Nov 2026, 7 PM (Dhaka)" onChange={e => update({ date: e.target.value })} /></label>
        <label className={label}>Location or online format<input className={input} value={selected.location ?? ""} onChange={e => update({ location: e.target.value })} /></label>
        <label className={`${label} sm:col-span-2`}>Summary<textarea rows={4} className={input} value={selected.summary} onChange={e => update({ summary: e.target.value })} /></label>
        <label className={`${label} sm:col-span-2`}>Offer terms or additional information<textarea rows={2} className={input} value={selected.disclaimer ?? ""} onChange={e => update({ disclaimer: e.target.value })} /></label>
        <label className={`${label} sm:col-span-2`}>Partners (one per line)<textarea className={input} value={(selected.partners ?? []).join("\n")} onChange={e => update({ partners: e.target.value.split("\n") })} /></label>
        <label className={label}>Poster URL<input className={input} value={selected.images[0]?.src ?? ""} onChange={e => update({ images: e.target.value ? [{ src: e.target.value, alt: selected.images[0]?.alt || selected.name }] : [] })} /></label>
        <label className={label}>Poster description<input className={input} value={selected.images[0]?.alt ?? ""} onChange={e => update({ images: [{ src: selected.images[0]?.src ?? "", alt: e.target.value }] })} /></label>
        <label className="focus-ring inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy-700"><UploadCloud size={18} /> Upload poster<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={e => { const file = e.target.files?.[0]; if (file) void upload(file); }} /></label>
        <button type="button" onClick={() => { if (!window.confirm(`Delete ${selected.name}? Save events to apply this deletion.`)) return; setItems(current => current.filter((_, i) => i !== index)); setIndex(0); }} className="focus-ring inline-flex items-center gap-2 text-sm font-bold text-red-700"><Trash2 size={16} /> Delete event</button>
        <label className="flex items-center gap-2 text-sm text-navy-900"><input type="checkbox" checked={selected.verified} onChange={e => update({ verified: e.target.checked })} /> Reviewed and ready to publish</label>
        <label className="flex items-center gap-2 text-sm text-navy-900"><input type="checkbox" checked={selected.active !== false} onChange={e => update({ active: e.target.checked })} /> Active</label>
      </fieldset> : <p className="p-6 text-sm text-navy-900/65">{busy ? "Loading events..." : "Add an event to get started."}</p>}
    </div>
    {status && <p role="status" className="mt-5 rounded-xl bg-ice p-4 text-sm text-navy-900">{status}</p>}
  </section>;
}
