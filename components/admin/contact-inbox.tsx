"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Inbox, RefreshCcw } from "lucide-react";
import type { DeliveryState } from "@/lib/contact-messages";

type ContactEnquiry = {
  id: string;
  receivedAt: string;
  fullName: string;
  email: string;
  phone: string;
  destination: string;
  studyLevel: string;
  preferredCity?: string;
  englishTest?: string;
  englishScore?: string;
  message?: string;
  deliveryChannel: "webhook" | "console" | "stored";
  delivered: boolean;
  dateOfBirth?: string;
  consent?: string;
  status?: "new" | "contacted" | "closed";
  notifications?: { teamEmail?: DeliveryState; confirmationEmail?: DeliveryState; webhook?: DeliveryState };
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function ContactInbox() {
  const [items, setItems] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [busyId, setBusyId] = useState("");

  async function change(id: string, action: "retry" | "new" | "contacted" | "closed") {
    setBusyId(id); setStatus("");
    try {
      const response = await fetch("/api/admin/enquiries", { method: action === "retry" ? "POST" : "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status: action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update enquiry.");
      await refresh();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Could not update enquiry."); }
    finally { setBusyId(""); }
  }

  const refresh = useCallback(async () => {
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/admin/enquiries");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load enquiries.");
      setItems(data.enquiries ?? []);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not load enquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/enquiries")
      .then((response) => response.json().then((data) => ({ response, data })))
      .then(({ response, data }) => {
        if (!alive) return;
        if (!response.ok) throw new Error(data.error ?? "Could not load enquiries.");
        setItems(data.enquiries ?? []);
        setLoading(false);
      })
      .catch((error) => {
        if (!alive) return;
        setStatus(error instanceof Error ? error.message : "Could not load enquiries.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section id="enquiries" className="mt-12 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[0.7rem] font-bold tracking-[0.18em] text-gold-500 uppercase">
            Contact messages
          </p>
          <h2 className="font-display mt-1 text-2xl font-extrabold text-navy-950">
            Enquiry inbox
          </h2>
          <p className="mt-2 text-sm text-navy-900/65">
            Latest 100 enquiries. All submissions are retained. Notification emails go to contact@readytostudy.com.au; visitor confirmations come from info@readytostudy.com.au.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="focus-ring inline-flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm font-extrabold text-navy-700 hover:bg-navy-50"
        >
          <RefreshCcw size={16} /> Refresh
        </button>
      </div>

      {loading && <p className="mt-6 text-sm text-navy-900/60">Loading enquiries...</p>}
      {status && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{status}</p>}
      {!loading && !status && items.length === 0 && (
        <div className="mt-6 grid min-h-44 place-items-center rounded-2xl bg-navy-50 p-8 text-center text-navy-900/65">
          <span>
            <Inbox size={28} className="mx-auto mb-3 text-gold-500" aria-hidden />
            No contact messages yet.
          </span>
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl bg-ice p-5 ring-1 ring-navy-100">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-extrabold text-navy-950">{item.fullName}</h3>
                  <p className="mt-1 text-xs font-semibold text-navy-900/55">{formatDate(item.receivedAt)}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-extrabold text-navy-700 ring-1 ring-navy-100">
                  <CheckCircle2 size={14} className="text-green-600" />
                  Saved · {item.status || "new"}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-navy-900/75 sm:grid-cols-2">
                <a href={`mailto:${item.email}`} className="font-bold text-navy-700 hover:underline">
                  {item.email}
                </a>
                <a href={`tel:${item.phone.replace(/\s/g, "")}`} className="font-bold text-navy-700 hover:underline">
                  {item.phone}
                </a>
                <p><span className="font-bold text-navy-900">Destination:</span> {item.destination}</p>
                <p><span className="font-bold text-navy-900">Level:</span> {item.studyLevel}</p>
                {item.dateOfBirth && <p><span className="font-bold text-navy-900">Date of birth:</span> {item.dateOfBirth}</p>}
                {item.preferredCity && <p><span className="font-bold text-navy-900">City:</span> {item.preferredCity}</p>}
                {(item.englishTest || item.englishScore) && (
                  <p>
                    <span className="font-bold text-navy-900">English:</span>{" "}
                    {[item.englishTest, item.englishScore].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
              {item.message && (
                <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm leading-relaxed text-navy-900/75 ring-1 ring-navy-100">
                  {item.message}
                </p>
              )}
              <p className="mt-4 break-all text-xs text-navy-900/55">Reference: RTS-{item.id.toUpperCase()} · Consent: {item.consent === "yes" ? "Granted" : "See record"}</p>
              <div className="mt-4 grid gap-2 text-xs text-navy-900/70">
                {(["teamEmail", "confirmationEmail"] as const).map(channel => <div key={channel}>
                  <span className="font-bold">{channel === "teamEmail" ? "Business notification" : "Visitor confirmation"}:</span> {item.notifications?.[channel]?.status === "sent" ? "Accepted by email provider" : item.notifications?.[channel]?.status || "Not sent"}
                  {item.notifications?.[channel]?.error && <p className="mt-1 text-red-700">{item.notifications[channel]?.error}</p>}
                </div>)}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-xs font-bold text-navy-900">Enquiry status <select disabled={busyId === item.id} aria-label={`Status for ${item.fullName}`} value={item.status || "new"} onChange={e => void change(item.id, e.target.value as "new" | "contacted" | "closed")} className="focus-ring ml-2 rounded-lg border border-navy-100 bg-white px-2 py-2"><option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option></select></label>
                <button type="button" disabled={busyId === item.id} onClick={() => void change(item.id, "retry")} className="focus-ring rounded-full border border-navy-200 bg-white px-3 py-2 text-xs font-bold text-navy-700 disabled:opacity-50">{busyId === item.id ? "Please wait..." : "Retry pending emails"}</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
