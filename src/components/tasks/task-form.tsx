"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dateTimeFields, scheduleInstant } from "@/features/events/dates";
import { priorityLabels, statusLabels } from "@/features/tasks/format";
import type { TaskEventOption, WeddingTask } from "@/features/tasks/types";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskStatus } from "@/types/domain";
import type { ApiResponse } from "@/types/api";
import { primaryAction, secondaryAction } from "./task-ui";

const inputClass = "w-full min-w-0 rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:border-outline-variant focus:bg-surface-container-lowest sm:text-sm";
type Fields = { title: string; description: string; eventId: string; date: string; time: string; priority: TaskPriority; status: TaskStatus };
export function TaskForm({ task, events, suggestedTitle = "" }: { task?: WeddingTask; events: TaskEventOption[]; suggestedTitle?: string }) {
  const router = useRouter(); const form = useRef<HTMLFormElement>(null); const pending = useRef(false);
  const deadline = task?.dueAt ? dateTimeFields(task.dueAt) : { date: "", time: "" };
  const [values, setValues] = useState<Fields>({ title: task?.title ?? suggestedTitle, description: task?.description ?? "", eventId: task?.eventId ?? "", ...deadline, priority: task?.priority ?? "MEDIUM", status: task?.status ?? "TODO" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [failure, setFailure] = useState(""); const [saving, setSaving] = useState(false);
  function change<K extends keyof Fields>(key: K, value: Fields[K]) { setValues(old => ({ ...old, [key]: value })); setErrors(old => ({ ...old, [key]: undefined })); }
  async function submit(e: FormEvent) {
    e.preventDefault(); if (pending.current) return;
    const invalid: typeof errors = {};
    if (!values.title.trim() || values.title.trim().length > 120) invalid.title = "Enter a task title (up to 120 characters).";
    if (values.description.trim().length > 5000) invalid.description = "Keep the description within 5000 characters.";
    if (values.date && !values.time) invalid.time = "Choose a deadline time, or clear the date for no deadline.";
    if (values.time && !values.date) invalid.date = "Choose a deadline date, or clear the time for no deadline.";
    const dueAt = values.date && values.time ? scheduleInstant(values.date, values.time) : undefined;
    if (values.date && values.time && !dueAt) invalid.date = "Choose a valid deadline date and time.";
    setErrors(invalid); setFailure("");
    if (Object.keys(invalid).length) { form.current?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)?.focus(); return; }
    pending.current = true; setSaving(true);
    let saved = false;
    try {
      const response = await fetch(task ? `/api/v1/tasks/${task.id}` : "/api/v1/tasks", { method: task ? "PUT" : "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: values.title, description: values.description, eventId: values.eventId || null, dueAt: dueAt ?? null, priority: values.priority, status: values.status }) });
      const result = await response.json() as ApiResponse<WeddingTask>;
      if (!response.ok || !result.success) { setFailure(!result.success && result.error?.details?.length ? result.error.details.join(" ") : result.message || "Your task could not be saved. Please try again."); return; }
      saved = true;
      router.push(`/tasks/${result.data.id}?saved=${task ? "updated" : "created"}`); router.refresh();
    } catch { setFailure("Your task could not be saved. Check your connection and try again. Your details are still here."); }
    // Keep submission locked after persistence while the destination page loads.
    // A slow navigation must not allow a second POST creating a duplicate task.
    finally { if (!saved) { pending.current = false; setSaving(false); } }
  }
  function input(key: "title" | "date" | "time", label: string, type = "text") {
    return <div className="min-w-0 space-y-2"><label className="flex justify-between gap-2 text-sm font-semibold" htmlFor={`task-${key}`}><span>{label}{key === "title" && <span aria-hidden="true" className="ml-1 text-error">*</span>}</span>{key === "title" && <span className="text-xs font-normal text-on-surface-variant">{values.title.length}/120</span>}</label>
      <input id={`task-${key}`} name={key} type={type} value={values[key]} maxLength={key === "title" ? 120 : undefined} required={key === "title"} onChange={e => change(key, e.target.value)} className={key === "title" ? inputClass : inputClass.replace("bg-surface-container-low ", "bg-surface-container-lowest ")} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} />
      {errors[key] && <p id={`${key}-error`} className="text-xs text-error">{errors[key]}</p>}</div>;
  }
  return <form ref={form} onSubmit={submit} noValidate aria-busy={saving} className="space-y-6 rounded-[20px] bg-surface-container-lowest p-5 shadow-sm sm:p-8">
    {failure && <p role="alert" className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure}</p>}
    {Object.values(errors).some(Boolean) && <p role="alert" className="text-sm text-error">Please check the highlighted details before saving.</p>}
    <fieldset disabled={saving} className="min-w-0 space-y-6 disabled:opacity-70">
      {input("title", "Task title")}<p className="-mt-4 text-xs text-on-surface-variant">A title is required to create a task.</p>
      <div className="space-y-2"><label htmlFor="task-description" className="text-sm font-semibold">Description <span className="font-normal text-on-surface-variant">(optional)</span></label><p id="description-help" className="text-xs text-on-surface-variant">Use this for details, specific requirements, or notes.</p>
        <textarea id="task-description" name="description" rows={4} maxLength={5000} value={values.description} onChange={e => change("description", e.target.value)} className={`${inputClass} resize-y`} aria-invalid={!!errors.description} aria-describedby={`description-help${errors.description ? " description-error" : ""}`} />{errors.description && <p id="description-error" className="text-xs text-error">{errors.description}</p>}</div>
      <div className="space-y-2"><label htmlFor="task-event" className="text-sm font-semibold">Related event <span className="font-normal text-on-surface-variant">(optional)</span></label><select id="task-event" name="eventId" className={inputClass} value={values.eventId} onChange={e => change("eventId", e.target.value)}><option value="">Wedding-wide</option>{events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}</select>{events.length === 0 && <p className="text-xs text-on-surface-variant">No events added yet. This task will stay wedding-wide.</p>}</div>
      <div className="space-y-4 rounded-xl bg-surface-container-low p-4"><p className="text-[11px] font-semibold uppercase tracking-wider">Due date &amp; time (optional) — Indian Standard Time (IST)</p><div className="grid gap-4 sm:grid-cols-2">{input("date", "Deadline date", "date")}{input("time", "Time (IST)", "time")}</div><p className="text-xs text-on-surface-variant">Past deadlines for unfinished tasks are flagged as overdue. Leave both fields blank for no deadline.</p>{(values.date || values.time) && <button type="button" className="text-xs font-semibold text-primary underline" onClick={() => { change("date", ""); change("time", ""); }}>Clear deadline</button>}</div>
      <fieldset><legend className="mb-3 text-sm font-semibold">Priority</legend><div className="grid grid-cols-3 gap-2">{TASK_PRIORITIES.map(priority => <label key={priority} className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs sm:text-sm ${values.priority === priority ? "bg-primary-container text-on-primary" : "bg-surface-container-low text-on-surface-variant"}`}><input className="size-3 accent-primary" type="radio" name="priority" value={priority} checked={values.priority === priority} onChange={() => change("priority", priority)} />{priorityLabels[priority]}</label>)}</div></fieldset>
      <fieldset><legend className="mb-3 text-sm font-semibold">Status</legend><div className="grid grid-cols-3 gap-2">{TASK_STATUSES.map(status => <label key={status} className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-2 text-xs sm:text-sm ${values.status === status ? "bg-primary-container text-on-primary" : "bg-surface-container-low text-on-surface-variant"}`}><input className="size-3 accent-primary" type="radio" name="status" value={status} checked={values.status === status} onChange={() => change("status", status)} />{statusLabels[status]}</label>)}</div></fieldset>
    </fieldset>
    <div className="flex items-center justify-end gap-3 border-t border-outline-variant/30 pt-5">{saving ? <span className={`${secondaryAction} opacity-50`}>Cancel</span> : <Link href={task ? `/tasks/${task.id}` : "/tasks"} className={secondaryAction}>Cancel</Link>}<button type="submit" disabled={saving} className={`${primaryAction} disabled:cursor-wait disabled:opacity-70`}>{saving ? "Saving…" : task ? "Save changes" : "Create task"}</button></div>
  </form>;
}
