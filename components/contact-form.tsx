"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { destinations as fallbackDestinations, type Destination } from "@/lib/destinations";
import { useJourney } from "@/lib/journey";
import type { SafeUser } from "@/lib/server-auth";
import Link from "next/link";

const studyLevels = ["Bachelor's", "Master's", "PhD", "Diploma", "MRes", "Others"];
const englishTests = ["IELTS", "PTE", "TOEFL", "GRE", "Other"];

type Status = "idle" | "sending" | "sent" | "error";

const inputCls =
  "focus-ring w-full rounded-xl border border-navy-100 bg-white px-4 py-3 text-navy-900 placeholder:text-navy-900/40";
const labelCls = "mb-1.5 block text-sm font-semibold text-navy-900";

export function ContactForm({ destinations = fallbackDestinations, user }: { destinations?: Destination[]; user: SafeUser }) {
  const [status, setStatus] = useState<Status>("idle");
  const [submissionId, setSubmissionId] = useState("");
  const [receipt, setReceipt] = useState<{ reference?: string; message?: string }>({});
  const [error, setError] = useState("");
  const { refreshAccount } = useJourney();
  const reduce = useReducedMotion();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const id = submissionId || crypto.randomUUID();
    setSubmissionId(id);
    data.submissionId = id;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "We could not send your enquiry. Please try again.");
      setReceipt(result.delivery ?? {});
      await refreshAccount();
      setStatus("sent");
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl bg-white p-10 text-center shadow-sm ring-1 ring-navy-100"
      >
        <CheckCircle2 size={44} className="mx-auto text-gold-500" aria-hidden />
        <h3 className="font-display mt-4 text-2xl font-extrabold text-navy-950">Received!</h3>
        <p role="status" className="mt-3 text-sm text-navy-900/75">{receipt.message}</p>
        {receipt.reference && <p className="mt-3 break-all rounded-xl bg-ice px-4 py-3 text-sm font-bold text-navy-900">Reference: {receipt.reference}</p>}
        <Link href="/student/history" className="mt-4 inline-block font-bold text-navy-700 underline">View your enquiry history</Link>
        <p className="mt-2 text-navy-900/75">
          A counsellor will contact you shortly. Prefer not to wait? Call us on{" "}
          <a href="tel:+61426243477" className="font-bold text-navy-700">+61 426 243 477</a>.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy-100 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className={labelCls}>Full Name *</label>
          <input id="fullName" name="fullName" required maxLength={120} autoComplete="name" defaultValue={user.name} className={inputCls} placeholder="Your full name" />
        </div>
        <div>
          <label htmlFor="dob" className={labelCls}>Date of Birth *</label>
          <input id="dob" name="dateOfBirth" type="date" required className={inputCls} />
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>Email *</label>
          <input id="email" name="email" type="email" required autoComplete="email" defaultValue={user.email} className={inputCls} placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone *</label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className={inputCls} placeholder="+880 1X XXX XXXXX" />
        </div>
        <div>
          <label htmlFor="destination" className={labelCls}>Study Destination *</label>
          <select id="destination" name="destination" required className={inputCls} defaultValue="">
            <option value="" disabled>Select a country</option>
            {destinations.map((d) => (
              <option key={d.slug} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="city" className={labelCls}>Preferred City</label>
          <input id="city" name="preferredCity" className={inputCls} placeholder="e.g. Sydney" />
        </div>
        <div>
          <label htmlFor="level" className={labelCls}>Preferred Study Level *</label>
          <select id="level" name="studyLevel" required className={inputCls} defaultValue="">
            <option value="" disabled>Select a level</option>
            {studyLevels.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-[1fr_110px] gap-3">
          <div>
            <label htmlFor="englishTest" className={labelCls}>English Proficiency</label>
            <select id="englishTest" name="englishTest" className={inputCls} defaultValue="">
              <option value="" disabled>Test taken</option>
              {englishTests.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="score" className={labelCls}>Score</label>
            <input id="score" name="englishScore" className={inputCls} placeholder="e.g. 7.0" />
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="message" className={labelCls}>Message</label>
        <textarea id="message" name="message" rows={4} maxLength={3000} className={inputCls} placeholder="Tell us about your study plans…" />
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="flex items-start gap-3 rounded-2xl bg-ice px-4 py-3 text-sm text-navy-900/75">
        <input name="consent" value="yes" type="checkbox" required className="mt-1 h-4 w-4 accent-navy-700" />
        <span>
          I consent to Ready to Study contacting me about my enquiry. This form does not collect documents,
          passport numbers or financial records.
          {" "}We will email you a confirmation and use your details to respond.
        </span>
      </label>
      {status === "error" && (
        <p role="alert" className="text-sm font-semibold text-badge-red">
          {error} You can also email contact@readytostudy.com.au.
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy-700 px-7 py-3.5 font-bold text-white shadow-lg shadow-navy-700/25 transition-transform hover:scale-105 disabled:opacity-60"
      >
        {status === "sending" ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        {status === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}
