"use client";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { WorkspaceLink, useWorkspaceNavigation } from "@/components/layout/workspace-navigation";
import { Icon } from "@/components/marketing/icon";
import { hasPermission } from "@/features/auth/permissions";
import { weddingDetailFields, weddingDetailsErrors } from "@/features/weddings/requests";
import type { CurrentWedding, WeddingDetails } from "@/features/weddings/types";
import type { Role } from "@/types/domain";
import type { ApiResponse } from "@/types/api";
import { UnsavedWeddingDialog } from "./unsaved-wedding-dialog";

const card = "min-w-0 rounded-3xl bg-surface-container-lowest p-6 shadow-[0_8px_32px_rgba(85,13,36,0.025)] sm:p-8";
const input = "min-h-12 w-full min-w-0 rounded-xl border border-outline-variant/60 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60 aria-invalid:border-error";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary disabled:opacity-50";
const secondary = "inline-flex min-h-11 items-center justify-center rounded-full border border-outline-variant px-6 py-3 text-sm font-semibold text-primary disabled:opacity-50";
type Failure = "error" | "expired" | "unavailable";
function details(wedding: CurrentWedding): WeddingDetails {
  return { groomName: wedding.groomName, brideName: wedding.brideName, weddingDate: wedding.weddingDate.slice(0, 10), location: wedding.location };
}
function dateLabel(date: string) {
  if (weddingDetailsErrors({ groomName: "Groom", brideName: "Bride", location: "Location", weddingDate: date }).weddingDate) return "Choose a valid wedding date";
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}
function WeddingPreview({ values, dirty, readOnly }: { values: WeddingDetails; dirty: boolean; readOnly: boolean }) {
  return <aside aria-label="Wedding preview" className={`${card} space-y-6`}>
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-display-md text-2xl text-primary">Wedding preview</h2><span className="rounded-full bg-secondary-container px-3 py-1 text-xs text-on-secondary-container">{dirty ? "Unsaved preview" : "Saved details"}</span></div>
    <p className="rounded-xl bg-surface-container-low p-4 text-xs leading-relaxed text-secondary">{readOnly ? "Current saved wedding details." : "Preview only — changes are saved when you select Save changes."}</p>
    <div className="min-w-0 space-y-6 rounded-2xl bg-surface-container-low p-5">
      <div><p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">Couple</p><p className="mt-2 break-words font-display-md text-3xl leading-relaxed text-primary">{values.groomName || "Groom"} &amp; {values.brideName || "Bride"}</p></div>
      <div className="flex items-start gap-3 border-t border-outline-variant/40 pt-5"><Icon name="calendar_month" className="shrink-0 text-xl text-primary" /><div className="min-w-0"><p className="text-xs text-secondary">Wedding date</p><p className="mt-1 break-words text-sm leading-relaxed">{dateLabel(values.weddingDate)}</p></div></div>
      <div className="flex items-start gap-3"><Icon name="location_on" className="shrink-0 text-xl text-primary" /><div className="min-w-0"><p className="text-xs text-secondary">Location</p><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{values.location || "Your wedding location"}</p></div></div>
    </div>
    <p className="text-xs leading-relaxed text-secondary">Updating wedding details keeps your wedding website URL and existing event schedules unchanged.</p>
  </aside>;
}
export function WeddingDetailsForm({ wedding, role }: { wedding: CurrentWedding; role: Role }) {
  const router = useRouter(), form = useRef<HTMLFormElement>(null), pending = useRef(false);
  const navigation = useWorkspaceNavigation();
  const [baseline, setBaseline] = useState(() => details(wedding)), [values, setValues] = useState(() => details(wedding));
  const [errors, setErrors] = useState<Partial<Record<keyof WeddingDetails, string>>>({});
  const [saving, setSaving] = useState(false), [failure, setFailure] = useState<Failure | null>(null), [message, setMessage] = useState(""), [success, setSuccess] = useState(false);
  const canEdit = hasPermission(role, "wedding:update");
  const dirty = canEdit && weddingDetailFields.some(key => values[key] !== baseline[key]);
  function change(key: keyof WeddingDetails, value: string) { setValues(old => ({ ...old, [key]: value })); setErrors(old => ({ ...old, [key]: undefined })); setSuccess(false); }
  async function save(event: FormEvent) {
    event.preventDefault(); if (pending.current || !dirty || !canEdit) return;
    const invalid = weddingDetailsErrors(values); setErrors(invalid); setFailure(null); setSuccess(false);
    if (Object.keys(invalid).length) { form.current?.querySelector<HTMLElement>(`[name="${Object.keys(invalid)[0]}"]`)?.focus(); return; }
    pending.current = true; setSaving(true);
    try {
      const response = await fetch("/api/v1/weddings/current", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json() as ApiResponse<CurrentWedding>;
      if (!response.ok || !result.success) {
        setFailure(response.status === 401 ? "expired" : response.status === 404 ? "unavailable" : "error");
        setMessage(response.status === 403 ? "Only the wedding owner or an admin can edit these details." : "We couldn’t save your changes. Please try again."); return;
      }
      const saved = details(result.data); setValues(saved); setBaseline(saved); setSuccess(true); router.refresh();
    } catch { setFailure("error"); setMessage("We couldn’t save your changes. Please try again."); }
    finally { pending.current = false; setSaving(false); }
  }
  const field = (key: keyof WeddingDetails, label: string, maximum?: number) => <div className="min-w-0 space-y-2">
    <div className="flex flex-wrap items-end justify-between gap-2"><label htmlFor={`wedding-${key}`} className="text-sm font-semibold">{label}{canEdit && <span aria-hidden="true" className="text-error"> *</span>}</label>{canEdit && maximum && <span className="text-xs text-secondary">{values[key].length} / {maximum}</span>}</div>
    {canEdit ? <input id={`wedding-${key}`} name={key} type={key === "weddingDate" ? "date" : "text"} value={values[key]} onChange={event => change(key, event.target.value)} maxLength={maximum} required className={input} aria-invalid={!!errors[key]} aria-describedby={`${key}-help${errors[key] ? ` ${key}-error` : ""}`} /> : <p id={`wedding-${key}`} className="min-h-12 break-words rounded-xl bg-surface-container-low p-4 text-sm">{key === "weddingDate" ? dateLabel(values[key]) : values[key]}</p>}
    <p id={`${key}-help`} className="text-xs leading-relaxed text-secondary">{key === "weddingDate" ? "Changing this date does not reschedule your existing events." : key === "location" ? "City or primary wedding location. Existing event venues stay unchanged." : `${label} comes ${key === "groomName" ? "first" : "second"} in your wedding name.`}</p>
    {errors[key] && <p id={`${key}-error`} className="text-xs text-error">{errors[key]}</p>}
  </div>;
  return <><div className="mb-7"><WorkspaceLink href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm text-primary"><Icon name="arrow_back" />Back to dashboard</WorkspaceLink><h1 className="mt-3 font-display-md text-4xl text-primary sm:text-5xl">Wedding Settings</h1><p className="mt-3 text-sm text-secondary">Keep your wedding details up to date.</p></div>
    {!canEdit && <p className="mb-6 rounded-2xl bg-secondary-container/50 p-5 text-sm text-primary">Only the wedding owner or an admin can edit these details.</p>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <form ref={form} onSubmit={save} noValidate aria-busy={saving} className={`${card} space-y-7`}>
        <div><h2 className="font-display-md text-3xl text-primary">Wedding details</h2><p className="mt-2 text-sm leading-relaxed text-secondary">These details identify your wedding across your workspace.</p></div>
        {success && <p role="status" className="rounded-xl bg-secondary-container p-4 text-sm text-on-secondary-container">Wedding details updated successfully.</p>}
        {failure && <div role="alert" className="space-y-3 rounded-xl bg-error-container p-4 text-sm text-on-error-container"><p>{failure === "expired" ? "Your session has expired. Please log in again." : failure === "unavailable" ? "This wedding workspace is unavailable." : message}</p><p>All your entered details have been preserved.</p>{failure === "expired" && <WorkspaceLink href="/login" className={secondary}>Log in</WorkspaceLink>}</div>}
        {Object.values(errors).some(Boolean) && <p role="alert" className="text-sm text-error">Please check the highlighted wedding details.</p>}
        <fieldset disabled={saving || failure === "expired" || failure === "unavailable"} className="min-w-0 space-y-7">
          <div className="grid gap-6 sm:grid-cols-2">{field("groomName", "Groom’s name", 100)}{field("brideName", "Bride’s name", 100)}</div>{field("weddingDate", "Wedding date")}{field("location", "Wedding location", 200)}
        </fieldset>
        {canEdit ? <div className="flex flex-wrap justify-end gap-3 border-t border-outline-variant/30 pt-6"><button type="button" disabled={saving} onClick={() => { const leave = () => router.push("/dashboard"); if (!pending.current && !navigation.block(leave)) leave(); }} className={secondary}>Cancel</button><button type="submit" disabled={!dirty || saving || failure === "expired" || failure === "unavailable"} className={primary}>{saving ? <><span aria-hidden="true" className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />Saving…</> : "Save changes"}</button></div> : <p className="rounded-xl bg-surface-container-low p-4 text-sm leading-relaxed text-secondary">To request changes, please contact the wedding owner or an admin.</p>}
      </form><WeddingPreview values={values} dirty={dirty} readOnly={!canEdit} />
    </div><UnsavedWeddingDialog dirty={dirty} saving={saving} onDiscard={() => { setValues(baseline); setErrors({}); setFailure(null); setSuccess(false); }} /></>;
}
type Load = { status: "loading" } | { status: "ready"; wedding: CurrentWedding } | { status: Failure };
export function WeddingSettings({ role }: { role: Role }) {
  const [state, setState] = useState<Load>({ status: "loading" }), controller = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    controller.current?.abort(); const next = new AbortController(); controller.current = next;
    void (async () => {
      try {
        const response = await fetch("/api/v1/weddings/current", { cache: "no-store", credentials: "same-origin", signal: next.signal });
        const result = await response.json() as ApiResponse<CurrentWedding>;
        if (!next.signal.aborted) setState(response.ok && result.success ? { status: "ready", wedding: result.data } : { status: response.status === 401 ? "expired" : response.status === 404 ? "unavailable" : "error" });
      } catch { if (!next.signal.aborted) setState({ status: "error" }); }
    })();
  }, []);
  useEffect(() => { load(); return () => controller.current?.abort(); }, [load]);
  if (state.status === "ready") return <WeddingDetailsForm wedding={state.wedding} role={role} />;
  if (state.status === "loading") return <div role="status" aria-label="Loading wedding settings" className={`${card} motion-safe:animate-pulse`}><span className="sr-only">Loading wedding settings…</span><div aria-hidden="true" className="space-y-7"><div className="h-10 w-2/3 rounded bg-surface-container" />{[0, 1, 2, 3].map(key => <div key={key} className="h-16 rounded bg-surface-container-low" />)}</div></div>;
  return <div role="alert" className={`${card} space-y-5 text-center`}><h1 className="font-display-md text-3xl text-primary">{state.status === "expired" ? "Session expired" : state.status === "unavailable" ? "Wedding workspace unavailable" : "Couldn’t load wedding settings"}</h1><p className="text-sm text-secondary">{state.status === "expired" ? "Please log in again." : state.status === "unavailable" ? "This wedding workspace is unavailable." : "We couldn’t load your wedding details. Please try again."}</p><div className="flex flex-wrap justify-center gap-3">{state.status === "expired" ? <WorkspaceLink href="/login" className={primary}>Log in</WorkspaceLink> : state.status === "error" ? <><button type="button" className={primary} onClick={() => { setState({ status: "loading" }); load(); }}>Retry</button><WorkspaceLink href="/dashboard" className={secondary}>Back to dashboard</WorkspaceLink></> : null}</div></div>;
}
