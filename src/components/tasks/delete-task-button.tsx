"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/marketing/icon";
import type { ApiResponse } from "@/types/api";
import { secondaryAction } from "./task-ui";

export function DeleteTaskButton({ id, title }: { id: string; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null), cancel = useRef<HTMLButtonElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const pending = useRef(false); const [saving, setSaving] = useState(false); const [failure, setFailure] = useState(""); const router = useRouter();
  function close() { if (!pending.current) { dialog.current?.close(); trigger.current?.focus(); } }
  async function remove() {
    if (pending.current) return;
    pending.current = true; setSaving(true); setFailure("");
    try {
      const response = await fetch(`/api/v1/tasks/${id}`, { method: "DELETE", credentials: "same-origin" });
      if (!response.ok) { const result = await response.json() as ApiResponse<never>; setFailure(result.message || "This task could not be deleted. Please try again."); return; }
      dialog.current?.close(); router.push("/tasks?deleted=1"); router.refresh();
    } catch { setFailure("This task could not be deleted. Check your connection and try again."); }
    finally { pending.current = false; setSaving(false); }
  }
  return <><button ref={trigger} type="button" className={`${secondaryAction} text-error`} onClick={() => { setFailure(""); dialog.current?.showModal(); cancel.current?.focus(); }}><Icon name="delete" />Delete task</button>
    <dialog ref={dialog} aria-labelledby="delete-task-title" aria-describedby="delete-task-description" onCancel={e => { if (pending.current) e.preventDefault(); }} onClose={() => trigger.current?.focus()} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest p-6 text-on-surface shadow-xl backdrop:bg-on-surface/40 sm:p-8">
      <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-error-container text-2xl text-error"><Icon name="delete" /></div><h2 id="delete-task-title" className="font-display-md text-[28px] leading-tight text-primary">Delete this task?</h2>
      <p className="mt-4 break-words rounded-xl bg-surface-container-low p-4 font-semibold">{title}</p><p id="delete-task-description" className="mt-4 text-sm leading-relaxed text-on-surface-variant">This permanently removes the task from your shared wedding checklist. Your related event and other planning records will stay. This cannot be undone.</p>
      {failure && <p role="alert" className="mt-4 rounded-xl bg-error-container p-3 text-sm text-on-error-container">{failure}</p>}
      <div className="mt-7 flex flex-wrap justify-end gap-3"><button ref={cancel} type="button" disabled={saving} onClick={close} className={secondaryAction}>Cancel</button><button type="button" disabled={saving} onClick={remove} className="min-h-11 rounded-full bg-error px-5 py-2.5 text-sm font-semibold text-on-error disabled:opacity-60">{saving ? "Deleting…" : "Delete task permanently"}</button></div>
    </dialog></>;
}
