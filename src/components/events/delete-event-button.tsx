"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/marketing/icon";
import { secondaryAction } from "./event-ui";
import type { ApiResponse } from "@/types/api";

export function DeleteEventButton({ id, name }: { id: string; name: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const cancel = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const pending = useRef(false);
  const [saving, setSaving] = useState(false);
  const [failure, setFailure] = useState("");
  const router = useRouter();
  function close() { if (!pending.current) { dialog.current?.close(); trigger.current?.focus(); } }
  async function remove() {
    if (pending.current) return;
    pending.current = true; setSaving(true); setFailure("");
    try {
      const response = await fetch(`/api/v1/events/${id}`, { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) {
        const result = await response.json() as ApiResponse<never>;
        setFailure(result.message || "This event could not be deleted. Please try again."); return;
      }
      dialog.current?.close();
      router.push("/events?deleted=1"); router.refresh();
    } catch { setFailure("This event could not be deleted. Check your connection and try again."); }
    finally { pending.current = false; setSaving(false); }
  }
  return <>
    <button ref={trigger} type="button" className={`${secondaryAction} text-error`} onClick={() => { setFailure(""); dialog.current?.showModal(); cancel.current?.focus(); }}><Icon name="delete" className="text-lg" />Delete event</button>
    <dialog ref={dialog} aria-labelledby="delete-event-title" aria-describedby="delete-event-description" onCancel={e => { if (pending.current) e.preventDefault(); }} onClose={() => trigger.current?.focus()}
      className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-on-surface/40 sm:p-8">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-error-container text-2xl text-error"><Icon name="delete" /></div>
      <h2 id="delete-event-title" className="font-display-md text-[28px] leading-tight text-primary">Delete this event?</h2>
      <p className="mt-4 break-words rounded-xl bg-surface-container-low p-4 font-semibold">{name}</p>
      <p id="delete-event-description" className="mt-4 text-sm leading-relaxed text-on-surface-variant">This permanently removes the event from your wedding schedule. Linked tasks, expenses, photos, and activities will stay in your workspace, without this event link. This cannot be undone.</p>
      {failure && <p role="alert" className="mt-4 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{failure}</p>}
      <div className="mt-7 flex justify-end gap-3">
        <button ref={cancel} type="button" disabled={saving} onClick={close} className={secondaryAction}>Cancel</button>
        <button type="button" disabled={saving} onClick={remove} className="min-h-11 rounded-xl bg-error px-5 py-2.5 text-sm font-semibold text-on-error disabled:opacity-60">{saving ? "Deleting…" : "Delete event permanently"}</button>
      </div>
    </dialog>
  </>;
}
