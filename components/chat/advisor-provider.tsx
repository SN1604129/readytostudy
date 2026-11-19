"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useJourney, type StudyLevel, type BudgetBand } from "@/lib/journey";
import type { Destination } from "@/lib/destinations";
import type { AdvisorMessage, AdvisorReply, AdvisorStatus, Preferences } from "@/lib/advisor/types";

type Context = {
  destinations: Destination[]; preferences: Preferences; setPreferences: (p: Preferences) => void;
  messages: AdvisorMessage[]; result: AdvisorReply | null; status: AdvisorStatus | null; busy: boolean;
  open: boolean; setOpen: (value: boolean) => void; refresh: () => Promise<void>;
  send: (text: string, mode: "chat" | "search", token: string) => Promise<void>;
  draft: string; setDraft: (value: string) => void; askAbout: (title: string) => void;
  cooldownUntil: number;
};
const AdvisorContext = createContext<Context | null>(null);

export function AdvisorProvider({ children, destinations }: { children: ReactNode; destinations: Destination[] }) {
  const { journey, update, user, conversation } = useJourney();
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [result, setResult] = useState<AdvisorReply | null>(null);
  const [status, setStatus] = useState<AdvisorStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const lock = useRef(false);
  const identity = useRef<string | undefined>(undefined);
  const preferences: Preferences = { destination: journey.destination, level: journey.level, field: journey.field, budget: journey.budget };
  const setPreferences = useCallback((p: Preferences) => update({ ...p, level: p.level as StudyLevel | undefined, budget: p.budget as BudgetBand | undefined }), [update]);
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/chat", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const next: AdvisorStatus = await response.json();
      if (next.userId !== user?.id) return;
      if (identity.current !== next.userId || !identity.current) { setMessages(conversation); setResult(null); setDraft(""); }
      identity.current = next.userId;
      setStatus(next);
    } catch { setStatus({ available: false, searchAvailable: false, signedIn: false, remaining: 0, searchesRemaining: 0, turnstileSiteKey: "", reason: "We couldn't connect to the advisor. Please try again later." }); }
  }, [user, conversation]);

  async function send(text: string, mode: "chat" | "search", token: string) {
    if (lock.current || !text.trim() || !user) return;
    lock.current = true; setBusy(true);
    const next: AdvisorMessage[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(next); setDraft("");
    try {
      const response = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: crypto.randomUUID(), mode, preferences, messages: next.slice(-6).map(m => ({ ...m, content: m.content.slice(0, 2000) })), turnstileToken: token }),
        signal: AbortSignal.timeout(65000),
      });
      const data: AdvisorReply = await response.json();
      if (identity.current !== user.id || data.status?.userId !== user.id) return;
      if (typeof data.reply !== "string") throw new Error();
      setMessages(current => [...current, { role: "assistant", content: data.reply }]);
      setResult(data);
      if (data.status) setStatus(data.status);
      if (data.preferences && Object.values(data.preferences).some(Boolean)) setPreferences(data.preferences);
      setCooldownUntil(Date.now() + (data.retryAfter || (response.ok ? 20 : 0)) * 1000);
    } catch {
      setMessages(current => [...current, { role: "assistant", content: "The connection was interrupted. Your course list is still available. Please wait a moment before trying again." }]);
      setCooldownUntil(Date.now() + 20000);
    } finally { lock.current = false; setBusy(false); }
  }

  function askAbout(title: string) {
    setDraft(`Tell me about ${title}. What should I check before applying?`);
    setOpen(true);
    document.getElementById("course-advisor")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const sameAccount = status?.userId === user?.id;
  return <AdvisorContext.Provider value={{ destinations, preferences, setPreferences, messages: user && sameAccount ? messages : [], result: user && sameAccount ? result : null, status: sameAccount ? status : null, busy, open, setOpen, refresh, send, draft, setDraft, askAbout, cooldownUntil }}>{children}</AdvisorContext.Provider>;
}

export function useAdvisor() {
  const value = useContext(AdvisorContext);
  if (!value) throw new Error("AdvisorProvider is required.");
  return value;
}
