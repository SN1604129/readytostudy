"use client";

import { useMemo, useState } from "react";
import { ClipboardCheck, Download, Save } from "lucide-react";
import { destinations } from "@/lib/destinations";
import { levels } from "@/lib/courses";
import { checklistGroups, getChecklist } from "@/lib/checklist";
import { useJourney } from "@/lib/journey";

const selectCls =
  "focus-ring w-full rounded-xl border border-navy-100 bg-white px-4 py-3 font-semibold text-navy-900";

export function DocumentChecklist() {
  const { journey, update, toggleChecklistItem } = useJourney();
  const [destination, setDestination] = useState(journey.destination ?? "australia");
  const [level, setLevel] = useState<string>(journey.level ?? "masters");
  const [includeArrival, setIncludeArrival] = useState(true);
  const items = useMemo(() => getChecklist({ destination, level, includeArrival }), [destination, level, includeArrival]);
  const done = new Set(journey.checklistDone);

  const grouped = items.reduce(
    (acc, item) => {
      acc[item.group] = [...(acc[item.group] ?? []), item];
      return acc;
    },
    {} as Record<string, typeof items>,
  );

  const saveBasics = () => {
    update({ destination, level: level as typeof journey.level });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
        <ClipboardCheck className="text-gold-500" size={30} aria-hidden />
        <h2 className="font-display mt-4 text-2xl font-extrabold text-navy-950">
          Generate a checklist
        </h2>
        <div className="mt-6 space-y-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">Destination</span>
            <select value={destination} onChange={(e) => setDestination(e.target.value)} className={selectCls}>
              {destinations.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-navy-900">Study level</span>
            <select value={level} onChange={(e) => setLevel(e.target.value)} className={selectCls}>
              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-3 rounded-2xl bg-ice px-4 py-3 text-sm font-semibold text-navy-900">
            <input
              type="checkbox"
              checked={includeArrival}
              onChange={(e) => setIncludeArrival(e.target.checked)}
              className="h-4 w-4 accent-navy-700"
            />
            Include arrival planning
          </label>
        </div>
        <button
          type="button"
          onClick={saveBasics}
          className="focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-navy-700 px-5 py-3 font-bold text-white"
        >
          <Save size={17} /> Save profile
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="focus-ring mt-3 inline-flex items-center gap-2 rounded-full border border-navy-200 px-5 py-3 font-bold text-navy-700"
        >
          <Download size={17} /> Print checklist
        </button>
      </aside>

      <section className="space-y-5">
        {Object.entries(checklistGroups).map(([group, label]) => {
          const groupItems = grouped[group] ?? [];
          if (groupItems.length === 0) return null;
          return (
            <div key={group} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100">
              <h3 className="font-display text-xl font-extrabold text-navy-950">{label}</h3>
              <ul className="mt-5 space-y-3">
                {groupItems.map((item) => {
                  const checked = done.has(item.id);
                  return (
                    <li key={item.id}>
                      <label className="flex cursor-pointer gap-3 rounded-2xl bg-ice px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleChecklistItem(item.id)}
                          className="mt-1 h-4 w-4 accent-navy-700"
                        />
                        <span>
                          <span className="font-bold text-navy-900">{item.label}</span>
                          <span className="mt-1 block text-sm text-navy-900/65">{item.detail}</span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}
