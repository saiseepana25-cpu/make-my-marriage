"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RSVP_STATUSES } from "@/types/domain";
import { attendanceLabels } from "@/features/guests/format";
import type { GuestList, GuestSummary } from "@/features/guests/types";
import { Icon } from "@/components/marketing/icon";
import { AttendanceBadge, GuestAvatar, guestCard, guestInput, GuestMetrics, GuestNotice, GuestReadOnly, GuestSkeleton, primaryAction, secondaryAction } from "./guest-ui";
import { useGuestData } from "./use-guest-data";

export function GuestFailure({ label, expired, retry }: { label: string; expired: boolean; retry: () => void }) {
  return <div role="alert" className={`${guestCard} text-center`}><Icon name="warning" className="text-3xl text-primary" /><h2 className="mt-3 text-xl font-semibold">Couldn’t load {label}</h2><p className="mt-3 text-sm text-secondary">{expired ? "Your session has expired. Please log in again." : "Your saved guest data has not been changed. Please try again."}</p>{expired ? <Link href="/login" className={`${primaryAction} mt-5`}>Log in</Link> : <button type="button" onClick={retry} className={`${primaryAction} mt-5`}>Retry {label}</button>}</div>;
}
function Summary() {
  const { state, reload } = useGuestData<GuestSummary>("/api/v1/guests/summary");
  return state.status === "loading" ? <GuestSkeleton label="Loading guest totals" /> : state.status === "error" ? <GuestFailure label="guest totals" expired={state.expired} retry={reload} /> : <GuestMetrics summary={state.data} />;
}
function GuestDirectory({ query, apply, manage }: { query: string; apply: (query: string) => void; manage: boolean }) {
  const { state, reload, lastData } = useGuestData<GuestList>(`/api/v1/guests?${query}`);
  const params = new URLSearchParams(query);
  const [search, setSearch] = useState(params.get("search") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  function filter(key: string, value: string) {
    if (timer.current) clearTimeout(timer.current);
    const next = new URLSearchParams(query); next.delete("page");
    // Include an in-progress search when a filter changes before its debounce fires.
    if (search.trim()) next.set("search", search.trim()); else next.delete("search");
    if (key === "family") {
      next.delete("familyName"); next.delete("withoutFamily");
      if (value === "none") next.set("withoutFamily", "true"); else if (value.startsWith("name:")) next.set("familyName", value.slice(5));
    } else if (value) next.set(key, value); else next.delete(key);
    apply(next.toString());
  }
  function searchChanged(value: string) {
    setSearch(value); if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { const next = new URLSearchParams(query); next.delete("page"); if (value.trim()) next.set("search", value.trim()); else next.delete("search"); apply(next.toString()); }, 350);
  }
  function clear() { if (timer.current) clearTimeout(timer.current); setSearch(""); apply("limit=8"); }
  function page(value: number) {
    if (timer.current) clearTimeout(timer.current);
    const next = new URLSearchParams(query);
    // A pending search starts on page one rather than losing the input on pagination.
    if (search.trim() !== (next.get("search") ?? "")) { next.delete("page"); if (search.trim()) next.set("search", search.trim()); else next.delete("search"); }
    else next.set("page", String(value));
    apply(next.toString());
  }
  const filtered = ["search", "rsvpStatus", "familyName", "withoutFamily"].some(key => !!params.get(key));
  const families = lastData?.families ?? (params.get("familyName") ? [params.get("familyName")!] : []);
  return <section className="space-y-5" aria-label="Guest directory"><div className={guestCard}><form onSubmit={event => { event.preventDefault(); filter("search", search.trim()); }} aria-label="Guest filters" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]">
    <input name="search" aria-label="Search guests" placeholder="Search by name, family, phone or email" maxLength={120} value={search} onChange={event => searchChanged(event.target.value)} className={`${guestInput} bg-surface-container-low`} />
    <select aria-label="Filter by attendance" value={params.get("rsvpStatus") ?? ""} onChange={event => filter("rsvpStatus", event.target.value)} className={`${guestInput} bg-surface-container-low`}><option value="">All attendance</option>{RSVP_STATUSES.map(status => <option key={status} value={status}>{attendanceLabels[status]}</option>)}</select>
    <select aria-label="Filter by family" value={params.get("withoutFamily") ? "none" : params.get("familyName") ? `name:${params.get("familyName")}` : ""} onChange={event => filter("family", event.target.value)} className={`${guestInput} bg-surface-container-low`}><option value="">All families</option><option value="none">No family name</option>{families.map(family => <option key={family} value={`name:${family}`}>{family}</option>)}</select>
    <button type="button" onClick={clear} className={`${secondaryAction} whitespace-nowrap`}>Clear filters</button><button type="submit" className="sr-only">Search</button>
  </form></div>
  {state.status === "loading" ? <GuestSkeleton label="Loading guests" /> : state.status === "error" ? <GuestFailure label="guest list" expired={state.expired} retry={reload} /> : <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/20 p-5 text-xs text-secondary"><p>{state.data.pagination.total} {filtered ? "matching" : "saved"} guest records</p><p>Newest first · Page {state.data.pagination.page} of {Math.max(1, state.data.pagination.pages)}</p></div>
    {state.data.guests.length ? <><div aria-hidden="true" className="hidden grid-cols-[1.3fr_1fr_1.5fr_1fr_auto] gap-4 bg-surface-container-low px-7 py-4 text-[10px] font-semibold uppercase tracking-wide text-secondary xl:grid"><span>Guest name</span><span>Family name</span><span>Contact details</span><span>Attendance status</span><span>Actions</span></div>
      {state.data.guests.map(guest => <article key={guest.id} className="grid min-w-0 gap-4 border-b border-outline-variant/20 p-5 sm:p-7 xl:grid-cols-[1.3fr_1fr_1.5fr_1fr_auto] xl:items-center"><div className="flex min-w-0 items-center gap-3"><GuestAvatar name={guest.name} /><h3 className="min-w-0 break-words text-sm font-semibold"><Link href={`/guests/${guest.id}`} className="hover:text-primary">{guest.name}</Link></h3></div><p className="break-words text-xs text-secondary"><span className="mb-1 block text-[10px] xl:hidden">Family name</span>{guest.familyName || "No family name"}</p><div className="min-w-0 space-y-2 break-all text-xs text-secondary"><p>{guest.phone ? <a className="hover:text-primary" href={`tel:${encodeURIComponent(guest.phone)}`}>{guest.phone}</a> : "Phone: Not provided"}</p><p>{guest.email ? <a className="hover:text-primary" href={`mailto:${encodeURIComponent(guest.email)}`}>{guest.email}</a> : "Email: Not provided"}</p></div><div><AttendanceBadge status={guest.rsvpStatus} /></div><Link href={`/guests/${guest.id}`} className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary">View details<Icon name="arrow_forward" /><span className="sr-only"> for {guest.name}</span></Link></article>)}
    </> : <div className="px-5 py-12 text-center"><Icon name="group" className="text-4xl text-primary" /><h2 className="mt-4 font-display-md text-2xl text-primary">{filtered ? "No guests match your filters" : "Your guest list starts here"}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-secondary">{filtered ? "Try another search or clear your filters to see your saved guests." : "Add your first guest to begin tracking attendance."}</p>{filtered ? <button type="button" onClick={clear} className={`${secondaryAction} mt-6`}>View all guests</button> : manage && <Link href="/guests/new" className={`${primaryAction} mt-6`}>Add your first guest</Link>}</div>}
    <div className="flex flex-wrap items-center justify-between gap-3 p-5 text-xs text-secondary"><p>Showing {state.data.guests.length ? (state.data.pagination.page - 1) * state.data.pagination.limit + 1 : 0}–{state.data.guests.length ? (state.data.pagination.page - 1) * state.data.pagination.limit + state.data.guests.length : 0} of {state.data.pagination.total} guest records</p><nav aria-label="Guest pagination" className="flex flex-wrap items-center gap-3"><button type="button" disabled={state.data.pagination.page <= 1} onClick={() => page(state.data.pagination.page - 1)} className={`${secondaryAction} disabled:opacity-40`}>Previous</button><span>Page {state.data.pagination.page} of {Math.max(1, state.data.pagination.pages)}</span><button type="button" disabled={state.data.pagination.page >= state.data.pagination.pages} onClick={() => page(state.data.pagination.page + 1)} className={`${secondaryAction} disabled:opacity-40`}>Next</button></nav></div>
  </div>}</section>;
}
export function GuestOverview({ manage, couple, deleted }: { manage: boolean; couple: string; deleted: boolean }) {
  const [query, setQuery] = useState("limit=8");
  return <div className="space-y-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">Wedding workspace · {couple}</p><h1 className="mt-2 font-display-md text-4xl text-primary sm:text-5xl">Guests</h1><p className="mt-3 text-sm text-secondary">Keep your guest list and attendance details together.</p></div>{manage && <Link href="/guests/new" className={primaryAction}><Icon name="add" />Add guest</Link>}</div>{deleted && <p role="status" className="rounded-xl bg-secondary-container p-4 text-sm">Guest deleted successfully. Your guest totals have been updated.</p>}{!manage && <GuestReadOnly />}<GuestNotice /><Summary /><GuestDirectory query={query} apply={setQuery} manage={manage} /></div>;
}
