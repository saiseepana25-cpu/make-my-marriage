"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dateTimeFields, scheduleInstant } from "@/features/events/dates";
import type { WeddingEvent } from "@/features/events/types";
import type { ApiResponse } from "@/types/api";
import { ceremonies, primaryAction, secondaryAction } from "./event-ui";

const inputClass = "w-full min-w-0 rounded-xl border border-transparent bg-surface-container-low px-4 py-3 text-base text-on-surface placeholder:text-outline focus:border-outline-variant focus:bg-surface-container-lowest sm:text-sm";
type Fields = { name: string; date: string; startTime: string; endDate: string; endTime: string; venue: string; location: string; description: string };
type Errors = Partial<Record<keyof Fields, string>>;

export function EventForm({ event, suggestedName = "" }: { event?: WeddingEvent; suggestedName?: string }) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const start = event ? dateTimeFields(event.startAt) : { date: "", time: "" };
  const end = event?.endAt ? dateTimeFields(event.endAt) : { date: "", time: "" };
  const [values, setValues] = useState<Fields>({ name: event?.name ?? suggestedName, date: start.date, startTime: start.time,
    endDate: end.date === start.date ? "" : end.date, endTime: end.time, venue: event?.venue ?? "", location: event?.location ?? "", description: event?.description ?? "" });
  const [errors, setErrors] = useState<Errors>({});
  const [failure, setFailure] = useState("");
  const [saving, setSaving] = useState(false);

  function change(key: keyof Fields, value: string) {
    setValues(previous => ({ ...previous, [key]: value }));
    setErrors(previous => ({ ...previous, [key]: undefined }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (submitting.current) return;
    const invalid: Errors = {};
    if (!values.name.trim()) invalid.name = "Event name is required.";
    if (!values.venue.trim()) invalid.venue = "Venue name is required.";
    if (!values.date) invalid.date = "Choose an event date.";
    if (!values.startTime) invalid.startTime = "Choose a start time.";
    const startAt = scheduleInstant(values.date, values.startTime);
    if (values.date && values.startTime && !startAt) invalid.date = "Choose a valid event date and time.";
    const endAt = values.endTime ? scheduleInstant(values.endDate || values.date, values.endTime) : undefined;
    if (values.endDate && !values.endTime) invalid.endTime = "Add an end time or clear the end date.";
    if (values.endTime && !endAt) invalid.endTime = "Choose a valid end date and time.";
    if (startAt && endAt && endAt < startAt) invalid.endTime = "End time must be on or after the start. For overnight events, choose an end date.";
    setErrors(invalid); setFailure("");
    if (Object.keys(invalid).length) {
      form.current?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)?.focus();
      return;
    }
    submitting.current = true; setSaving(true);
    try {
      const response = await fetch(event ? `/api/v1/events/${event.id}` : "/api/v1/events", {
        method: event ? "PUT" : "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name, venue: values.venue, startAt, endAt: endAt ?? null, location: values.location, description: values.description }),
      });
      const result = await response.json() as ApiResponse<WeddingEvent>;
      if (!response.ok || !result.success) {
        const details = !result.success ? result.error?.details : [];
        setFailure(details?.length ? details.join(" ") : result.message || "Your event could not be saved. Please try again.");
        return;
      }
      router.push(`/events/${result.data.id}?saved=${event ? "updated" : "created"}`);
      router.refresh();
    } catch { setFailure("Your event could not be saved. Check your connection and try again. Your details are still here."); }
    finally { submitting.current = false; setSaving(false); }
  }

  function field(key: keyof Fields, label: string, type = "text", required = false, maximum?: number) {
    const error = errors[key];
    return <div className="min-w-0 space-y-2">
      <label htmlFor={`event-${key}`} className="flex items-center justify-between gap-2 text-sm font-semibold">
        <span>{label}{required && <span aria-hidden="true" className="ml-1 text-error">*</span>}</span>
        {!required && <span className="text-xs font-normal text-on-surface-variant">Optional</span>}
      </label>
      <input id={`event-${key}`} name={key} type={type} value={values[key]} onChange={e => change(key, e.target.value)} required={required} maxLength={maximum}
        aria-invalid={!!error} aria-describedby={error ? `${key}-error` : undefined} className={inputClass} />
      {error && <p id={`${key}-error`} className="text-xs text-error">{error}</p>}
    </div>;
  }
  function textarea(key: "location" | "description", label: string, maximum: number, placeholder: string) {
    return <div className="space-y-2"><label htmlFor={`event-${key}`} className="flex justify-between gap-2 text-sm font-semibold">{label}<span className="text-xs font-normal text-on-surface-variant">Optional</span></label>
      <textarea id={`event-${key}`} name={key} value={values[key]} onChange={e => change(key, e.target.value)} maxLength={maximum} rows={3} placeholder={placeholder} className={`${inputClass} resize-y`} />
    </div>;
  }
  return <form ref={form} onSubmit={submit} noValidate aria-busy={saving} className="space-y-7 rounded-2xl bg-surface-container-lowest p-5 shadow-sm sm:p-8 lg:p-10">
    <p className="rounded-xl bg-surface-container-low px-4 py-3 text-xs text-on-surface-variant">Fields marked with <span className="text-error">*</span> are required. All times are in Indian Standard Time (IST).</p>
    {failure && <div role="alert" className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure}</div>}
    {Object.values(errors).some(Boolean) && <p role="alert" className="text-sm text-error">Please check the highlighted details before saving.</p>}
    <fieldset disabled={saving} className="min-w-0 space-y-7 disabled:opacity-70">
      {field("name", "Event name", "text", true, 150)}
      <div><p className="mb-2 text-xs text-on-surface-variant">Quick ceremony names</p><div className="flex flex-wrap gap-2">
        {ceremonies.map(name => <button key={name} type="button" onClick={() => change("name", name)} className={`rounded-full px-3 py-1.5 text-xs transition-colors ${values.name === name ? "bg-primary-fixed text-primary" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"}`}>{name}</button>)}
      </div></div>
      <div className="grid gap-5 sm:grid-cols-3">{field("date", "Event date", "date", true)}{field("startTime", "Start time", "time", true)}{field("endTime", "End time", "time")}</div>
      <div className="max-w-sm">{field("endDate", "End date", "date")}<p className="mt-2 text-xs text-on-surface-variant">Leave blank for the same day. Choose a later date if the ceremony finishes after midnight.</p></div>
      {field("venue", "Venue name", "text", true, 250)}
      {textarea("location", "Address & landmarks", 1000, "Address, nearby landmarks, or entrance details")}
      {textarea("description", "Description & notes", 5000, "Tell your family about the ceremony, dress code, or anything to keep in mind")}
    </fieldset>
    <div className="flex flex-col gap-4 border-t border-outline-variant/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-on-surface-variant">Saved to your shared wedding workspace.</p>
      <div className="flex items-center gap-3">
        {saving ? <span className={`${secondaryAction} opacity-50`}>Cancel</span> : <Link href={event ? `/events/${event.id}` : "/events"} className={secondaryAction}>Cancel</Link>}
        <button type="submit" disabled={saving} className={`${primaryAction} flex-1 disabled:cursor-wait disabled:opacity-70`}>
          {saving ? "Saving…" : event ? "Save changes" : "Create event"}
        </button>
      </div>
    </div>
  </form>;
}
