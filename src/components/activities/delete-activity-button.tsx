"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ApiResponse } from "@/types/api";
import type { WeddingActivity } from "@/features/activities/types";
import { activityTimestamp } from "@/features/activities/format";
import { secondaryAction, SourceBadge } from "./activity-ui";
export function DeleteActivityButton({ activity, disabled = false }: { activity: WeddingActivity; disabled?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null), cancel = useRef<HTMLButtonElement>(null), trigger = useRef<HTMLButtonElement>(null), pending = useRef(false);
  const [saving, setSaving] = useState(false), [failure, setFailure] = useState(""); const router = useRouter();
  async function remove() {
    if (pending.current) return; pending.current = true; setSaving(true); setFailure(""); let deleted = false;
    try {
      const response = await fetch(`/api/v1/activities/${activity.id}`, { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) { const result = await response.json() as ApiResponse<never>; setFailure(response.status === 404 ? "This update is no longer available. Cancel and return to activities." : result.message || "Unable to delete this update. Please retry."); return; }
      deleted = true; dialog.current?.close(); router.push("/activities?deleted=1"); router.refresh();
    } catch { setFailure("Unable to delete this update. Check your connection and retry."); }
    finally { if (!deleted) { pending.current = false; setSaving(false); } }
  }
  if (!activity.canModify) return null;
  return <><button ref={trigger} type="button" disabled={disabled} className={`${secondaryAction} text-error disabled:opacity-50`} onClick={() => { setFailure(""); dialog.current?.showModal(); cancel.current?.focus(); }}>Delete update</button><dialog ref={dialog} aria-labelledby="delete-activity-title" aria-describedby="delete-activity-description" aria-busy={saving} onCancel={event => { if (pending.current) event.preventDefault(); }} onClose={() => trigger.current?.focus()} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-on-surface/40 sm:p-8">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-error">Permanent action</p><h2 id="delete-activity-title" className="mt-2 font-display-md text-3xl text-primary">Delete this update?</h2><p id="delete-activity-description" className="mt-5 text-sm leading-relaxed text-secondary">This permanently removes the manual update from your wedding activity feed. This cannot be undone.</p>
    <div className="my-5 space-y-3 rounded-xl bg-surface-container-low p-5"><SourceBadge source="MANUAL" /><p className="break-words font-semibold">{activity.title}</p><p className="break-words text-xs text-secondary">Author: {activity.authorName}</p><p className="text-xs text-secondary">{activityTimestamp(activity.createdAt)}</p></div><p className="rounded-xl bg-error-container p-4 text-sm leading-relaxed text-on-error-container">Only this update is removed. Related events, tasks, expenses and guest records remain unchanged.</p>
    {failure && <p role="alert" className="mt-5 rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure}</p>}<div className="mt-7 flex flex-wrap justify-end gap-3"><button ref={cancel} type="button" disabled={saving} onClick={() => { if (!pending.current) dialog.current?.close(); }} className={`${secondaryAction} min-w-24 whitespace-nowrap disabled:opacity-50`}>Cancel</button><button type="button" disabled={saving} onClick={remove} className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-error px-5 py-2.5 text-sm font-semibold text-on-error disabled:opacity-60">{saving ? <><span aria-hidden="true" className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />Deleting…</> : failure ? "Retry delete" : "Delete update"}</button></div>
  </dialog></>;
}
