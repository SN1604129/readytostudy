"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize: (options: { client_id: string; nonce: string; callback: (response: { credential: string }) => void; auto_select: boolean; ux_mode: string }) => void;
      renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
      disableAutoSelect: () => void;
    } } };
  }
}

export function GoogleSignIn({ clientId, nextPath }: { clientId: string; nextPath: string }) {
  const element = useRef<HTMLDivElement>(null);
  const preparation = useRef<Promise<{ nonce: string }> | null>(null);
  const lock = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const signIn = useCallback(async ({ credential }: { credential: string }) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/google", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ credential }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not sign in with Google.");
      try { window.localStorage.setItem("rts.auth.changed", crypto.randomUUID()); } catch { /* Signing in does not require browser storage. */ }
      const target = new URL(data.redirect || "/student", window.location.origin);
      window.location.assign(target.origin === window.location.origin ? target.pathname + target.search + target.hash : "/student");
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not sign in with Google.");
      preparation.current = null; setAttempt(value => value + 1);
    } finally { lock.current = false; setBusy(false); }
  }, []);

  useEffect(() => {
    if (!ready || !element.current || !window.google?.accounts.id) return;
    let active = true;
    preparation.current ??= fetch("/api/auth/google/prepare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ next: nextPath }) })
      .then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Google sign-in could not load. Please use email and password."); return data; });
    preparation.current.then(data => {
      if (!active || !element.current || !window.google?.accounts.id) return;
      window.google.accounts.id.initialize({ client_id: clientId, nonce: data.nonce, callback: response => void signIn(response), auto_select: false, ux_mode: "popup" });
      element.current.replaceChildren();
      window.google.accounts.id.renderButton(element.current, { theme: "outline", size: "large", text: "continue_with", shape: "pill", width: Math.min(360, element.current.clientWidth || 300) });
    }).catch(failure => { if (active) setError(failure instanceof Error ? failure.message : "Google sign-in could not load. Please use email and password."); });
    return () => { active = false; };
  }, [ready, clientId, nextPath, signIn, attempt]);

  return <div className="mt-6 border-b border-navy-100 pb-6">
    <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setError("Google sign-in could not load. Please use email and password.")} />
    <div ref={element} className={`flex min-h-11 justify-center ${busy ? "pointer-events-none opacity-60" : ""}`} aria-label="Google sign-in" />
    {busy && <p role="status" className="mt-2 text-center text-sm text-navy-700">Signing in with Google…</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    <p className="mt-4 text-center text-xs text-navy-600">Or continue with email and password</p>
  </div>;
}
