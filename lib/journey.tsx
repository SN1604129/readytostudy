"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { SafeUser } from "./server-auth";
import type { AdvisorMessage } from "./advisor/types";
import { applyJourneyCommand, emptyJourney, JOURNEY_VERSION, type JourneyCommand, type JourneyPatch, type JourneyState, type SavedCourse } from "./journey-state";
export { emptyJourney, JOURNEY_VERSION } from "./journey-state";
export type { StudyLevel, BudgetBand, EnglishStatus, SavedCourse, BudgetEstimate, JourneyState } from "./journey-state";
const STORAGE_KEY = "rts.journey.v1";

function isValid(value: unknown): value is JourneyState {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<JourneyState>;
  return (
    v.version === JOURNEY_VERSION &&
    Array.isArray(v.priorities) &&
    Array.isArray(v.savedCourses) &&
    Array.isArray(v.checklistDone) &&
    Array.isArray(v.stamps)
  );
}

/* ------------------------------------------------------------------ store */

let snapshot: JourneyState = emptyJourney;
let persistent = false;
let initialised = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function init() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isValid(parsed)) snapshot = parsed;
    }
    window.localStorage.setItem("rts.probe", "1");
    window.localStorage.removeItem("rts.probe");
    persistent = true;
  } catch {
    persistent = false;
  }
  emit();
}

function persist(next: JourneyState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — state still works for this session */
  }
}

function setState(updater: (prev: JourneyState) => JourneyState) {
  const next = updater(snapshot);
  if (next === snapshot) return;
  snapshot = next;
  persist(next);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  init();
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      const parsed: unknown = e.newValue ? JSON.parse(e.newValue) : null;
      snapshot = isValid(parsed) ? parsed : emptyJourney;
      emit();
    } catch {
      /* ignore malformed cross-tab payloads */
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => snapshot;
const getServerSnapshot = () => emptyJourney;


type AccountSnapshot = { user: SafeUser | null; journey: JourneyState; conversation: AdvisorMessage[]; loading: boolean };
const initialAccount: AccountSnapshot = { user: null, journey: emptyJourney, conversation: [], loading: true };
type JourneyContextValue = {
  journey: JourneyState; persistent: boolean; user: SafeUser | null; accountLoading: boolean;
  conversation: AdvisorMessage[]; refreshAccount: () => Promise<void>;
  update: (patch: JourneyPatch) => void; togglePriority: (id: string) => void;
  toggleChecklistItem: (id: string) => void; saveCourse: (course: SavedCourse) => void;
  removeCourse: (title: string) => void; addStamp: (id: string) => void; reset: () => void;
};
const JourneyContext = createContext<JourneyContextValue | null>(null);

export function JourneyProvider({ children }: { children: ReactNode }) {
  const guest = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [account, setAccount] = useState(initialAccount);
  const current = useRef(account);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const generation = useRef(0);
  const pending = useRef<Array<{ id: string; command: JourneyCommand }>>([]);
  const processing = useRef<number | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const commit = useCallback((value: AccountSnapshot) => { current.current = value; setAccount(value); }, []);

  const loadAccount = useCallback(async (epoch: number) => {
    try {
      const response = await fetch("/api/account", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load your saved plan. Refresh the page to try again.");
      const data = await response.json();
      if (epoch !== generation.current) return;
      commit({ user: data.user, journey: data.journey || emptyJourney, conversation: data.conversation || [], loading: false });
    } catch {
      if (epoch === generation.current) setError("Could not load your account. Refresh the page before saving changes.");
    }
  }, [commit]);
  const refreshAccount = useCallback(async () => {
    const epoch = ++generation.current;
    pending.current = [];
    commit({ ...initialAccount });
    setError("");
    await loadAccount(epoch);
  }, [commit, loadAccount]);
  useEffect(() => { void loadAccount(++generation.current); }, [loadAccount]);
  useEffect(() => {
    const changed = (event: StorageEvent) => { if (event.key === "rts.auth.changed") void refreshAccount(); };
    window.addEventListener("storage", changed);
    return () => window.removeEventListener("storage", changed);
  }, [refreshAccount]);

  const flush = useCallback(async () => {
    const epoch = generation.current;
    if (processing.current === epoch || !current.current.user) return;
    processing.current = epoch;
    setSaving(true);
    try {
      while (pending.current.length && epoch === generation.current) {
        const action = pending.current[0];
        const response = await fetch("/api/account/journey", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action, (_key, value) => value === undefined ? null : value) });
        const data = await response.json();
        if (epoch !== generation.current) return;
        if (response.status === 401) {
          pending.current = [];
          commit({ ...initialAccount, loading: false });
          throw new Error("Your session has expired. Log in to continue saving.");
        }
        if (!response.ok) throw new Error(data.error || "Changes have not been saved. Try again.");
        pending.current.shift();
        const journey = pending.current.reduce((value, item) => applyJourneyCommand(value, item.command), data.journey as JourneyState);
        commit({ ...current.current, journey });
        setError("");
      }
    } catch (failure) {
      if (epoch === generation.current) setError(failure instanceof Error ? failure.message : "Changes have not been saved. Try again.");
    } finally { if (processing.current === epoch) { processing.current = null; setSaving(false); } }
  }, [commit]);

  const dispatch = useCallback((command: JourneyCommand, requireAccount = false) => {
    const state = current.current;
    if (state.loading) return;
    if (!state.user) {
      if (requireAccount) { router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`); return; }
      setState(value => applyJourneyCommand(value, command));
      return;
    }
    const journey = applyJourneyCommand(state.journey, command);
    if (JSON.stringify(journey) === JSON.stringify(state.journey)) return;
    pending.current.push({ id: crypto.randomUUID(), command });
    commit({ ...state, journey });
    void flush();
  }, [commit, flush, router]);

  // Log page paths only. Search parameters can contain private information.
  const lastVisit = useRef("");
  useEffect(() => {
    if (!account.user || !/^\/(?:$|about$|services$|events$|contact$|course-finder$|destinations(?:\/[a-z0-9-]+)?$|budget$|checklist$|compare$|readiness$|student(?:\/history)?$|pte-ielts-support(?:\/[a-z-]+){0,2}$)/.test(pathname)) return;
    const visit = `${account.user.id}:${pathname}`;
    if (lastVisit.current === visit) return;
    lastVisit.current = visit;
    void fetch("/api/account/history", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: crypto.randomUUID(), path: pathname }), keepalive: true });
  }, [account.user, pathname]);

  const update = useCallback((patch: JourneyPatch) => dispatch({ type: "patch", patch }, Boolean(patch.budgetEstimate)), [dispatch]);
  const togglePriority = useCallback((id: string) => dispatch({ type: "priority", id }, true), [dispatch]);
  const toggleChecklistItem = useCallback((id: string) => dispatch({ type: "checklist", id }, true), [dispatch]);
  const saveCourse = useCallback((course: SavedCourse) => dispatch({ type: "save-course", course }, true), [dispatch]);
  const removeCourse = useCallback((title: string) => dispatch({ type: "remove-course", title }, true), [dispatch]);
  const addStamp = useCallback((id: string) => dispatch({ type: "stamp", id }), [dispatch]);
  const reset = useCallback(() => dispatch({ type: "reset" }), [dispatch]);
  const value = useMemo(() => ({ journey: account.user ? account.journey : guest, persistent: account.user ? true : persistent, user: account.user, accountLoading: account.loading, conversation: account.conversation, refreshAccount, update, togglePriority, toggleChecklistItem, saveCourse, removeCourse, addStamp, reset }), [account, guest, refreshAccount, update, togglePriority, toggleChecklistItem, saveCourse, removeCourse, addStamp, reset]);

  return <JourneyContext.Provider value={value}>
    {children}
    {(saving || error) && <div role="status" className="fixed bottom-3 left-3 z-[60] max-w-[calc(100vw-6rem)] rounded-2xl border border-navy-100 bg-white p-3 text-sm text-navy-900 shadow-xl">
      {error || "Saving your study plan…"}
      {error && account.user && <button type="button" onClick={() => void flush()} className="focus-ring ml-2 font-bold underline">Retry saving</button>}
      {error && !account.user && !account.loading && <Link href="/login" className="ml-2 font-bold underline">Log in</Link>}
    </div>}
  </JourneyContext.Provider>;
}

export function useJourney() {
  const value = useContext(JourneyContext);
  if (!value) throw new Error("JourneyProvider is required.");
  return value;
}

/* -------------------------------------------------------------- readiness */

/** Transparent progress measure — NOT an admission or visa prediction. */
export const readinessSteps = [
  { id: "destination", label: "Destination chosen", href: "/destinations", done: (j: JourneyState) => Boolean(j.destination) },
  { id: "level", label: "Study level chosen", href: "/course-finder", done: (j: JourneyState) => Boolean(j.level) },
  { id: "field", label: "Field of interest chosen", href: "/course-finder", done: (j: JourneyState) => Boolean(j.field) },
  { id: "budget", label: "Budget planned", href: "/budget", done: (j: JourneyState) => Boolean(j.budget) },
  { id: "english", label: "English test status recorded", href: "/checklist", done: (j: JourneyState) => Boolean(j.englishStatus) },
  { id: "courses", label: "Course shortlist started", href: "/course-finder", done: (j: JourneyState) => j.savedCourses.length > 0 },
  { id: "documents", label: "Document preparation started", href: "/checklist", done: (j: JourneyState) => j.checklistDone.length > 0 },
  { id: "consultation", label: "Consultation requested", href: "/contact", done: (j: JourneyState) => j.consultationRequested },
] as const;

export function readinessScore(j: JourneyState) {
  const done = readinessSteps.filter((s) => s.done(j)).length;
  return { done, total: readinessSteps.length, percent: Math.round((done / readinessSteps.length) * 100) };
}
