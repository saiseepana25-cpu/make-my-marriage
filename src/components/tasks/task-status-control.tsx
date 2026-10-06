"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TASK_STATUSES, type TaskStatus } from "@/types/domain";
import { statusLabels } from "@/features/tasks/format";
import type { ApiResponse } from "@/types/api";
import { Icon } from "@/components/marketing/icon";

export function TaskStatusControl({ id, status, title, compact = false }: { id: string; status: TaskStatus; title?: string; compact?: boolean }) {
  const router = useRouter(); const pending = useRef(false); const [saving, setSaving] = useState(false); const [failure, setFailure] = useState(""); const [success, setSuccess] = useState("");
  async function change(next: TaskStatus) {
    if (pending.current || next === status) return;
    pending.current = true; setSaving(true); setFailure(""); setSuccess("");
    try {
      const response = await fetch(`/api/v1/tasks/${id}/status`, { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: next }) });
      const result = await response.json() as ApiResponse<unknown>;
      if (!response.ok || !result.success) { setFailure(result.message || "Could not update status. Please try again."); return; }
      setSuccess(`Status updated to ${statusLabels[next]}.`); router.refresh();
    } catch { setFailure("Could not update status. Check your connection and try again."); }
    finally { pending.current = false; setSaving(false); }
  }
  if (compact) return <div className="shrink-0"><button type="button" role="checkbox" aria-checked={status === "COMPLETED"} aria-label={`Mark ${title} ${status === "COMPLETED" ? "as to do" : "completed"}`} disabled={saving} onClick={() => change(status === "COMPLETED" ? "TODO" : "COMPLETED")} className="-m-2 flex size-10 items-center justify-center rounded-full text-lg text-primary-container disabled:opacity-50"><Icon name={status === "COMPLETED" ? "check_circle" : "radio_button_unchecked"} /></button>{failure && <span role="alert" className="block max-w-28 text-xs font-normal text-error">{failure}</span>}{success && <span role="status" className="sr-only">{success}</span>}</div>;
  return <div className="space-y-3"><fieldset disabled={saving} aria-busy={saving}><legend className="mb-3 text-sm font-semibold">Update task status</legend><div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">{TASK_STATUSES.map(value => <button key={value} type="button" aria-pressed={status === value} onClick={() => change(value)} className={`min-h-11 min-w-0 rounded-full px-2 py-2 text-xs disabled:opacity-60 sm:px-4 sm:text-sm ${status === value ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface"}`}>{statusLabels[value]}</button>)}</div></fieldset>{saving && <p role="status" className="text-xs text-on-surface-variant">Updating status…</p>}{success && !saving && <p role="status" className="text-xs text-on-surface-variant">{success}</p>}{failure && <p role="alert" className="text-sm text-error">{failure}</p>}</div>;
}
