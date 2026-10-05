"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postAuth, useAuthReady } from "./auth-client";

export function LogoutButton() {
  const ready = useAuthReady();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <div className="text-right">
    <button type="button" disabled={!ready || pending} className="rounded-full border border-outline-variant px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-container disabled:opacity-60"
      onClick={async () => {
        setPending(true); setError("");
        try { await postAuth("/api/v1/auth/logout", {}); router.replace("/login"); router.refresh(); }
        catch { setError("Couldn’t log out. Please try again."); setPending(false); }
      }}>{pending ? "Logging out…" : "Log out"}</button>
    {error && <p role="alert" className="mt-2 max-w-60 text-xs text-error">{error}</p>}
  </div>;
}
