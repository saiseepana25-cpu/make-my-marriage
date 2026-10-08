"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WeddingActivity } from "@/features/activities/types";
import type { ApiResponse } from "@/types/api";
import { activityCard, activityInput, ActivityNotice, primaryAction, secondaryAction, SourceBadge } from "./activity-ui";
import { DeleteActivityButton } from "./delete-activity-button";
type Fields = { title: string; description: string; relatedEventId: string; activityType: string };
export function ActivityForm({ activity, events, authorName }: { activity?: WeddingActivity; events: { id: string; name: string }[]; authorName: string }) {
  const router = useRouter(), form = useRef<HTMLFormElement>(null), pending = useRef(false);
  const [values, setValues] = useState<Fields>({ title: activity?.title ?? "", description: activity?.description ?? "", relatedEventId: activity?.relatedEventId ?? "", activityType: activity?.activityType ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [saving, setSaving] = useState(false), [failure, setFailure] = useState("");
  function change(key: keyof Fields, value: string) { setValues(old => ({ ...old, [key]: value })); setErrors(old => ({ ...old, [key]: undefined })); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    const invalid: typeof errors = {};
    if (!values.title.trim() || values.title.length > 120) invalid.title = "Enter a title (up to 120 characters).";
    if (values.description.length > 5000) invalid.description = "Keep the description within 5000 characters.";
    if (values.activityType.length > 80) invalid.activityType = "Keep the category within 80 characters.";
    if (values.relatedEventId && !events.some(event => event.id === values.relatedEventId)) invalid.relatedEventId = "Choose an existing event or Wedding-wide.";
    setErrors(invalid); setFailure("");
    if (Object.keys(invalid).length) { form.current?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)?.focus(); return; }
    pending.current = true; setSaving(true); let saved = false;
    try {
      const response = await fetch(activity ? `/api/v1/activities/${activity.id}` : "/api/v1/activities", { method: activity ? "PUT" : "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json() as ApiResponse<WeddingActivity>;
      if (!response.ok || !result.success) { setFailure(!result.success && result.error?.details?.length ? result.error.details.join(" ") : result.message || "Unable to save this update. Please try again."); return; }
      saved = true; router.push(`/activities/${result.data.id}?saved=${activity ? "updated" : "created"}`); router.refresh();
    } catch { setFailure("Unable to save this update. Check your connection and try again."); }
    finally { if (!saved) { pending.current = false; setSaving(false); } }
  }
  function textField(key: "title" | "description" | "activityType", label: string, maximum: number, placeholder: string) {
    const attributes = { id: `activity-${key}`, name: key, value: values[key], maxLength: maximum, onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => change(key, event.target.value), placeholder, className: activityInput, "aria-invalid": !!errors[key], "aria-describedby": `${key}-help${errors[key] ? ` ${key}-error` : ""}` };
    return <div className="min-w-0 space-y-2"><div className="flex flex-wrap items-end justify-between gap-2"><label htmlFor={attributes.id} className="text-sm font-semibold">{label} {key === "title" ? <span aria-hidden="true" className="text-error">*</span> : <span className="font-normal text-secondary">(optional)</span>}</label><span className="text-xs text-secondary">{values[key].length} / {maximum.toLocaleString("en-IN")}</span></div>{key === "description" ? <textarea {...attributes} rows={7} /> : <input {...attributes} required={key === "title"} />}<p id={`${key}-help`} className="text-xs text-secondary">{key === "title" ? "Title is required (up to 120 characters)." : key === "description" ? "Share details or instructions with your family." : "Use your own category or choose a suggestion below."}</p>{errors[key] && <p id={`${key}-error`} className="text-xs text-error">{errors[key]}</p>}</div>;
  }
  return <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"><form ref={form} onSubmit={submit} noValidate aria-busy={saving} className={`${activityCard} space-y-7 sm:p-9`}>
    <div><h1 className="font-display-md text-3xl text-primary sm:text-4xl">{activity ? "Edit update" : "Add update"}</h1><p className="mt-3 text-sm leading-relaxed text-secondary">Share an update with everyone using your wedding workspace.</p></div><ActivityNotice />
    {failure && <p role="alert" className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure} All your entered details have been preserved.</p>}{Object.values(errors).some(Boolean) && <p role="alert" className="text-sm text-error">Please check the highlighted details before saving.</p>}
    <fieldset disabled={saving} className="min-w-0 space-y-7 disabled:opacity-70">{textField("title", "Title", 120, "e.g. Wedding outfits are ready")}{textField("description", "Description", 5000, "Share details or instructions with your family…")}
      <div className="grid gap-6 sm:grid-cols-2"><div className="min-w-0 space-y-2"><label htmlFor="activity-event" className="text-sm font-semibold">Related event <span className="font-normal text-secondary">(optional)</span></label><select id="activity-event" name="relatedEventId" value={values.relatedEventId} onChange={event => change("relatedEventId", event.target.value)} className={activityInput} aria-invalid={!!errors.relatedEventId} aria-describedby={errors.relatedEventId ? "event-error" : "event-help"}><option value="">Wedding-wide</option>{events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}</select><p id="event-help" className="text-xs leading-relaxed text-secondary">Link this update to an existing event or leave it wedding-wide.</p>{errors.relatedEventId && <p id="event-error" className="text-xs text-error">{errors.relatedEventId}</p>}</div>
        <div className="min-w-0">{textField("activityType", "Category", 80, "e.g. Planning update, Wardrobe, Logistics")}<div className="mt-3 flex flex-wrap gap-2" aria-label="Category suggestions">{["Wardrobe", "Logistics", "Hospitality", "Decor"].map(category => <button key={category} type="button" onClick={() => change("activityType", category)} className="min-h-9 rounded-full bg-surface-container-low px-3 py-2 text-xs text-secondary">{category}</button>)}</div></div>
      </div>
    </fieldset>{activity && <p className="text-xs leading-relaxed text-secondary">Editing keeps the original author and creation time. The update stays in its original position in the timeline.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-6">{activity && <DeleteActivityButton activity={activity} disabled={saving} />}<div className="ml-auto flex flex-wrap gap-3">{saving ? <button type="button" disabled className={`${secondaryAction} whitespace-nowrap opacity-50`}>Cancel</button> : <Link href={activity ? `/activities/${activity.id}` : "/activities"} className={`${secondaryAction} whitespace-nowrap`}>Cancel</Link>}<button type="submit" disabled={saving} className={`${primaryAction} whitespace-nowrap disabled:opacity-60`}>{saving ? <><span aria-hidden="true" className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />Saving…</> : failure ? "Retry save" : activity ? "Save changes" : "Save update"}</button></div></div>
  </form><aside className={`${activityCard} space-y-5`} aria-label="Update preview"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xs font-semibold uppercase tracking-widest text-secondary">Preview</h2><SourceBadge source="MANUAL" /></div><p className="text-xs text-secondary">Preview only — changes are saved when you submit.</p><div className="min-w-0 space-y-4 rounded-xl bg-surface-container-low p-5"><p className="break-words text-sm font-semibold text-primary">{activity?.authorName ?? authorName}</p><p className="break-words text-xs text-secondary">{events.find(event => event.id === values.relatedEventId)?.name ?? "Wedding-wide"}</p><h3 className="break-words font-display-md text-2xl text-primary">{values.title.trim() || "Your update title"}</h3><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary">{values.description.trim() || "Your description will appear here."}</p><p className="break-words border-t border-outline-variant/30 pt-4 text-xs text-secondary">Category: {values.activityType.trim() || "Not provided"}</p></div></aside></div>;
}
