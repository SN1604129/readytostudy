"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useJourney } from "@/lib/journey";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { refreshAccount } = useJourney();

  const logout = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      try { window.google?.accounts?.id?.disableAutoSelect?.(); } catch { /* The server session has already been revoked. */ }
      await refreshAccount();
      try { window.localStorage.setItem("rts.auth.changed", crypto.randomUUID()); } catch { /* No browser storage needed. */ }
      router.refresh();
      router.push("/login");
    } catch { setError("Could not log out. Try again."); }
    finally { setBusy(false); }
  };

  return (
    <div><button
      type="button"
      onClick={logout}
      disabled={busy}
      className="focus-ring inline-flex items-center gap-2 rounded-full border border-navy-200 px-4 py-2 text-sm font-bold text-navy-700 hover:bg-navy-50 disabled:cursor-wait disabled:opacity-70"
    >
      <LogOut size={16} /> {busy ? "Signing out..." : "Log out"}
    </button>{error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</div>
  );
}
