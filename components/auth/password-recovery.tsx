"use client";
import { useState } from "react";
import Link from "next/link";

export function PasswordRecovery({ reset = false }: { reset?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${reset ? "reset-password" : "forgot-password"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), token: window.location.hash.slice(1) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Please try again.");
      if (reset) window.history.replaceState(null, "", window.location.pathname);
      setDone(true); setMessage(reset ? "Your password has been updated. Please log in with your new password." : data.message);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(false); }
  }
  return <section className="mx-auto max-w-md px-4 py-16"><div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-navy-100">
    <h1 className="font-display text-3xl font-extrabold text-navy-950">{reset ? "Choose a new password" : "Forgot your password?"}</h1>
    {!done && <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm font-bold text-navy-900">{reset ? "New password" : "Email address"}<input name={reset ? "password" : "email"} type={reset ? "password" : "email"} autoComplete={reset ? "new-password" : "email"} required minLength={reset ? 8 : undefined} maxLength={reset ? 128 : 254} className="focus-ring mt-2 w-full rounded-xl border border-navy-100 px-4 py-3" /></label>
      <button disabled={busy} className="focus-ring w-full rounded-full bg-navy-700 px-5 py-3 font-bold text-white disabled:opacity-60">{busy ? "Please wait..." : reset ? "Update password" : "Send reset link"}</button>
    </form>}
    {message && <p role="status" className="mt-5 text-sm text-navy-900/75">{message}</p>}
    <Link href="/login" className="focus-ring mt-6 inline-block text-sm font-bold text-navy-700 underline">Back to login</Link>
  </div></section>;
}
