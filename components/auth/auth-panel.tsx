"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { useJourney } from "@/lib/journey";
import { GoogleSignIn } from "./google-signin";

type AuthMode = "login" | "signup";
type Role = "student" | "admin";

export function AuthPanel({ mode, nextPath = "", googleClientId = "" }: { mode: AuthMode; nextPath?: string; googleClientId?: string }) {
  const router = useRouter();
  const { refreshAccount } = useJourney();
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isSignup = mode === "signup";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      role,
      inviteCode: String(form.get("inviteCode") ?? ""),
    };

    try {
    const response = await fetch(`/api/auth/${isSignup ? "signup" : "login"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    setBusy(false);

    if (!response.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }

    await refreshAccount();
    try { window.localStorage.setItem("rts.auth.changed", crypto.randomUUID()); } catch { /* Account refresh still works without storage. */ }
    router.refresh();
    const target = new URL(nextPath || "/student", window.location.origin);
    router.push(data.user?.role === "admin" ? "/admin" : target.origin === window.location.origin ? target.pathname + target.search : "/student");
    } catch { setError("Could not connect. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-navy-900/10 ring-1 ring-navy-100">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy-700 text-white">
          {isSignup ? <UserPlus size={22} /> : <LogIn size={22} />}
        </span>
        <div>
          <p className="text-[0.68rem] font-extrabold tracking-[0.18em] text-gold-500 uppercase">
            {isSignup ? "Create access" : "Welcome back"}
          </p>
          <h1 className="font-display text-2xl font-extrabold text-navy-950">
            {isSignup ? "Sign up" : "Log in"}
          </h1>
        </div>
      </div>

      {googleClientId && <GoogleSignIn clientId={googleClientId} nextPath={nextPath} />}
      <form onSubmit={submit} className="mt-6 space-y-4">
        {isSignup && (
          <label className="block">
            <span className="text-sm font-bold text-navy-900">Full name</span>
            <input
              name="name"
              required
              className="focus-ring mt-1 w-full rounded-xl border border-navy-100 px-4 py-3"
              placeholder="Your name"
            />
          </label>
        )}

        <label className="block">
          <span className="text-sm font-bold text-navy-900">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            className="focus-ring mt-1 w-full rounded-xl border border-navy-100 px-4 py-3"
            placeholder="you@example.com"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-navy-900">Password</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="focus-ring mt-1 w-full rounded-xl border border-navy-100 px-4 py-3"
            placeholder="At least 8 characters"
          />
        </label>

        {isSignup && (
          <>
            <div>
              <span className="text-sm font-bold text-navy-900">Account type</span>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["student", "admin"] as Role[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setRole(item)}
                    aria-pressed={role === item}
                    className={`focus-ring rounded-xl px-4 py-3 text-sm font-extrabold capitalize ${
                      role === item ? "bg-navy-700 text-white" : "bg-navy-50 text-navy-800"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {role === "admin" && (
              <label className="block">
                <span className="text-sm font-bold text-navy-900">Admin invite code</span>
                <input
                  name="inviteCode"
                  type="password"
                  className="focus-ring mt-1 w-full rounded-xl border border-navy-100 px-4 py-3"
                  placeholder="Enter your admin invite code"
                />
                <span className="mt-1 block text-xs text-navy-900/55">
                  Ask the website owner for your admin invite code.
                </span>
              </label>
            )}
          </>
        )}

        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="focus-ring w-full rounded-full bg-gold-500 px-5 py-3 font-extrabold text-navy-950 transition hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
        >
          {busy ? "Please wait..." : isSignup ? "Create account" : "Log in"}
        </button>
      </form>
      {!isSignup && <Link href="/forgot-password" className="focus-ring mt-4 block text-center text-sm font-bold text-navy-700 hover:underline">Forgot your password?</Link>}

      <p className="mt-5 text-center text-sm text-navy-900/65">
        {isSignup ? "Already have an account?" : "Need an account?"}{" "}
        <Link href={`${isSignup ? "/login" : "/signup"}${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`} className="font-bold text-navy-700 hover:underline">
          {isSignup ? "Log in" : "Sign up"}
        </Link>
      </p>
    </div>
  );
}
