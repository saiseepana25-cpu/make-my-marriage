"use client";
import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RSVP_STATUSES } from "@/types/domain";
import { attendanceLabels } from "@/features/guests/format";
import { validGuestCount, validGuestEmail } from "@/features/guests/requests";
import type { WeddingGuest } from "@/features/guests/types";
import type { ApiResponse } from "@/types/api";
import { guestCard, guestInput, GuestNotice, primaryAction, secondaryAction } from "./guest-ui";
type Fields = { name: string; phone: string; email: string; familyName: string; numberInvited: string; numberAttending: string; rsvpStatus: string; notes: string };
export function GuestForm({ guest, families }: { guest?: WeddingGuest; families: string[] }) {
  const router = useRouter(), form = useRef<HTMLFormElement>(null), pending = useRef(false);
  const [values, setValues] = useState<Fields>({ name: guest?.name ?? "", phone: guest?.phone ?? "", email: guest?.email ?? "", familyName: guest?.familyName ?? "", numberInvited: guest?.numberInvited == null ? "" : String(guest.numberInvited), numberAttending: guest?.numberAttending == null ? "" : String(guest.numberAttending), rsvpStatus: guest?.rsvpStatus ?? "PENDING", notes: guest?.notes ?? "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [saving, setSaving] = useState(false), [failure, setFailure] = useState("");
  function change(key: keyof Fields, value: string) { setValues(old => ({ ...old, [key]: value })); setErrors(old => ({ ...old, [key]: undefined })); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending.current) return;
    const invalid: typeof errors = {};
    if (!values.name.trim() || values.name.trim().length > 120) invalid.name = "Enter a guest name (up to 120 characters).";
    if (values.phone.trim().length > 80) invalid.phone = "Keep the phone number within 80 characters.";
    if (values.email.trim() && (!validGuestEmail(values.email.trim()) || values.email.trim().length > 254)) invalid.email = "Enter a valid email address or leave it blank.";
    if (values.familyName.trim().length > 120) invalid.familyName = "Keep the family name within 120 characters.";
    for (const key of ["numberInvited", "numberAttending"] as const) if (values[key].trim() && !validGuestCount(Number(values[key]))) invalid[key] = "Enter a whole number of zero or more, or leave it blank.";
    if (!RSVP_STATUSES.includes(values.rsvpStatus as typeof RSVP_STATUSES[number])) invalid.rsvpStatus = "Choose an attendance status.";
    if (values.notes.trim().length > 5000) invalid.notes = "Keep notes within 5000 characters.";
    setErrors(invalid); setFailure("");
    if (Object.keys(invalid).length) { form.current?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)?.focus(); return; }
    pending.current = true; setSaving(true); let saved = false;
    try {
      const response = await fetch(guest ? `/api/v1/guests/${guest.id}` : "/api/v1/guests", { method: guest ? "PUT" : "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, numberInvited: values.numberInvited.trim() ? Number(values.numberInvited) : null, numberAttending: values.numberAttending.trim() ? Number(values.numberAttending) : null }) });
      const result = await response.json() as ApiResponse<WeddingGuest>;
      if (!response.ok || !result.success) { setFailure(!result.success && result.error?.details?.length ? result.error.details.join(" ") : result.message || "Unable to save guest changes. Please try again."); return; }
      saved = true; router.push(`/guests/${result.data.id}?saved=${guest ? "updated" : "created"}`); router.refresh();
    } catch { setFailure("Unable to save guest changes. Check your connection and try again. Your details are still here."); }
    finally { if (!saved) { pending.current = false; setSaving(false); } }
  }
  function field(key: Exclude<keyof Fields, "notes" | "rsvpStatus">, label: string, placeholder: string, help?: string) {
    const numeric = key === "numberInvited" || key === "numberAttending";
    return <div className="min-w-0 space-y-2"><label htmlFor={`guest-${key}`} className="text-sm font-semibold">{label} {key === "name" ? <span aria-hidden="true" className="text-error">*</span> : <span className="font-normal text-secondary">(optional)</span>}</label><input id={`guest-${key}`} name={key} value={values[key]} onChange={event => change(key, event.target.value)} placeholder={placeholder} type={numeric ? "number" : key === "email" ? "email" : key === "phone" ? "tel" : "text"} min={numeric ? 0 : undefined} step={numeric ? 1 : undefined} inputMode={numeric ? "numeric" : undefined} required={key === "name"} maxLength={numeric ? undefined : key === "email" ? 254 : key === "phone" ? 80 : 120} className={guestInput} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : help ? `${key}-help` : undefined} />{help && <p id={`${key}-help`} className="text-xs text-secondary">{help}</p>}{errors[key] && <p id={`${key}-error`} className="text-xs text-error">{errors[key]}</p>}</div>;
  }
  return <div className="space-y-6"><form ref={form} onSubmit={submit} noValidate aria-busy={saving} className={`${guestCard} space-y-6 sm:p-9`}>
    {failure && <p role="alert" className="rounded-xl bg-error-container p-4 text-sm text-on-error-container">{failure} Your entered information has been preserved.</p>}{Object.values(errors).some(Boolean) && <p role="alert" className="text-sm text-error">Please check the highlighted details before saving.</p>}
    <fieldset disabled={saving} className="min-w-0 space-y-6 disabled:opacity-70">{field("name", "Guest name", "e.g. Rajesh Sharma")}<div className="grid gap-6 sm:grid-cols-2">{field("phone", "Phone number", "+91 98201 XXXXX")}{field("email", "Email address", "name@example.com")}</div>
      <div>{field("familyName", "Family name", "e.g. Sharma Family")}{families.length > 0 && <div className="mt-3 flex flex-wrap gap-2" aria-label="Family name suggestions">{families.slice(0, 8).map(family => <button type="button" key={family} onClick={() => change("familyName", family)} className="min-h-9 max-w-full break-words rounded-full bg-surface-container-low px-3 py-2 text-xs text-secondary">+ {family}</button>)}</div>}</div>
      {field("numberInvited", "Number invited", "e.g. 2", "People covered by this guest entry. Leave blank if unknown; zero is valid.")}
      <fieldset className="space-y-3"><legend className="text-sm font-semibold">Attendance status <span aria-hidden="true" className="text-error">*</span></legend><div className="grid gap-2 rounded-xl bg-surface-container p-2 sm:grid-cols-3">{RSVP_STATUSES.map(status => <label key={status} className={`flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm ${values.rsvpStatus === status ? "bg-surface-container-lowest text-primary shadow-sm" : "text-secondary"}`}><input type="radio" name="rsvpStatus" value={status} checked={values.rsvpStatus === status} onChange={() => change("rsvpStatus", status)} required className="accent-primary" />{attendanceLabels[status]}</label>)}</div><p className="text-xs text-secondary">Attendance is updated manually by wedding organizers.</p>{errors.rsvpStatus && <p className="text-xs text-error">{errors.rsvpStatus}</p>}</fieldset>
      {field("numberAttending", "Number attending", "e.g. 0", "People confirmed for this guest entry. Leave blank if unknown; zero is valid.")}
      <div className="space-y-2"><label htmlFor="guest-notes" className="text-sm font-semibold">Notes <span className="font-normal text-secondary">(optional)</span></label><textarea id="guest-notes" name="notes" rows={5} maxLength={5000} value={values.notes} onChange={event => change("notes", event.target.value)} placeholder="Add any notes for this guest…" className={guestInput} aria-invalid={!!errors.notes} aria-describedby={errors.notes ? "notes-error" : "notes-help"} /><p id="notes-help" className="text-xs text-secondary">Visible only in your private wedding workspace.</p>{errors.notes && <p id="notes-error" className="text-xs text-error">{errors.notes}</p>}</div>
    </fieldset><div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant/30 pt-6">{saving ? <button type="button" disabled className={`${secondaryAction} whitespace-nowrap opacity-50`}>Cancel</button> : <Link href={guest ? `/guests/${guest.id}` : "/guests"} className={`${secondaryAction} whitespace-nowrap`}>Cancel</Link>}<button type="submit" disabled={saving} className={`${primaryAction} whitespace-nowrap disabled:opacity-60`}>{saving ? "Saving…" : failure ? "Retry save" : guest ? "Save changes" : "Save guest"}</button></div>
  </form><GuestNotice /></div>;
}
