"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types/api";
import type { GuestSummary, WeddingGuest } from "@/features/guests/types";
import { AttendanceBadge, GuestNotice, secondaryAction } from "./guest-ui";
import { useGuestData } from "./use-guest-data";
export function DeleteGuestButton({ guest }: { guest: WeddingGuest }) {
  const dialog = useRef<HTMLDialogElement>(null), cancel = useRef<HTMLButtonElement>(null), trigger = useRef<HTMLButtonElement>(null), pending = useRef(false);
  const [saving, setSaving] = useState(false), [failure, setFailure] = useState(""); const router = useRouter();
  const { state } = useGuestData<GuestSummary>("/api/v1/guests/summary");
  async function remove() {
    if (pending.current) return; pending.current = true; setSaving(true); setFailure(""); let deleted = false;
    try {
      const response = await fetch(`/api/v1/guests/${guest.id}`, { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) { const result = await response.json() as ApiResponse<never>; setFailure(response.status === 404 ? "This guest is no longer available. Cancel and return to the guest list." : result.message || "Unable to delete guest right now. Please retry."); return; }
      deleted = true; dialog.current?.close(); router.push("/guests?deleted=1"); router.refresh();
    } catch { setFailure("Unable to delete guest right now. Check your connection and retry."); }
    finally { if (!deleted) { pending.current = false; setSaving(false); } }
  }
  return <><button ref={trigger} type="button" className={`${secondaryAction} text-error`} onClick={() => { setFailure(""); dialog.current?.showModal(); cancel.current?.focus(); }}>Delete guest</button><dialog ref={dialog} aria-labelledby="delete-guest-title" aria-describedby="delete-guest-description" onCancel={event => { if (pending.current) event.preventDefault(); }} onClose={() => trigger.current?.focus()} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-on-surface/40 sm:p-8">
    {failure && <p role="alert" className="mb-5 rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure}</p>}<p className="text-[10px] font-semibold uppercase tracking-widest text-error">Permanent action</p><h2 id="delete-guest-title" className="mt-2 font-display-md text-3xl text-primary">Delete guest?</h2><p id="delete-guest-description" className="mt-5 text-sm leading-relaxed text-secondary">This permanently removes {guest.name} from your wedding guest list and updates the guest totals. This cannot be undone.</p>
    <div className="mt-5 space-y-3 rounded-xl bg-surface-container-low p-4"><div className="flex flex-wrap justify-between gap-3"><p className="text-xs font-semibold">Guest record summary</p><AttendanceBadge status={guest.rsvpStatus} /></div><p className="break-words font-semibold">{guest.name}</p><p className="break-words text-xs text-secondary">Family name: {guest.familyName || "Not provided"}</p><p className="break-all text-xs text-secondary">{guest.phone || "Phone: Not provided"} · {guest.email || "Email: Not provided"}</p><div className="grid grid-cols-2 gap-3 text-xs"><p>Number invited: {guest.numberInvited ?? "Not provided"}</p><p>Number attending: {guest.numberAttending ?? "Not provided"}</p></div></div>
    <div className="my-5 rounded-xl bg-surface-container-low p-4 text-sm text-secondary"><p className="font-semibold text-primary">{state.status === "ready" ? `Total guest records: ${state.data.total} → ${Math.max(0, state.data.total - 1)}` : "Your guest totals will be recalculated after deletion."}</p><p className="mt-2">Other guest records sharing this family name remain unchanged.</p></div><GuestNotice /><div className="mt-7 flex flex-wrap justify-end gap-3"><button ref={cancel} type="button" disabled={saving} onClick={() => { if (!pending.current) dialog.current?.close(); }} className={`${secondaryAction} min-w-24 whitespace-nowrap disabled:opacity-50`}>Cancel</button><button type="button" disabled={saving} onClick={remove} className="min-h-11 whitespace-nowrap rounded-full bg-error px-5 py-2.5 text-sm font-semibold text-on-error disabled:opacity-60">{saving ? "Deleting…" : failure ? "Retry delete" : "Delete guest"}</button></div>
  </dialog></>;
}
