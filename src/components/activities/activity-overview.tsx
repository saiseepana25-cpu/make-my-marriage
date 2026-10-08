"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/marketing/icon";
import { activityDay } from "@/features/activities/format";
import type { ActivityList, WeddingActivity } from "@/features/activities/types";
import { ActivityFailure } from "./activity-failure";
import { activityCard, activityInput, ActivityItem, ActivityNotice, ActivitySkeleton, primaryAction, secondaryAction } from "./activity-ui";
import { useActivityData } from "./use-activity-data";

export function ActivityOverview({ deleted }: { deleted: boolean }) {
  const [query, setQuery] = useState("limit=10"), [search, setSearch] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const { state, reload, lastData } = useActivityData<ActivityList>(`/api/v1/activities?${query}`);
  const params = new URLSearchParams(query);
  function apply(key: string, value: string) {
    if (timer.current) clearTimeout(timer.current);
    const next = new URLSearchParams(query); next.delete("page");
    if (search.trim()) next.set("search", search.trim()); else next.delete("search");
    if (value) next.set(key, value); else next.delete(key);
    setQuery(next.toString());
  }
  function searchChanged(value: string) {
    setSearch(value); if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { const next = new URLSearchParams(query); next.delete("page"); if (value.trim()) next.set("search", value.trim()); else next.delete("search"); setQuery(next.toString()); }, 350);
  }
  function clear() { if (timer.current) clearTimeout(timer.current); setSearch(""); setQuery("limit=10"); }
  function page(value: number) {
    if (timer.current) clearTimeout(timer.current);
    const next = new URLSearchParams(query);
    if (search.trim() !== (next.get("search") ?? "")) { next.delete("page"); if (search.trim()) next.set("search", search.trim()); else next.delete("search"); }
    else next.set("page", String(value));
    setQuery(next.toString());
  }
  const filtered = ["search", "sourceType", "relatedEventId"].some(key => !!params.get(key));
  const groups = new Map<string, WeddingActivity[]>();
  if (state.status === "ready") for (const activity of state.data.activities) {
    const day = activityDay(activity.createdAt, state.data.asOf);
    groups.set(day, [...(groups.get(day) ?? []), activity]);
  }
  return <div className="space-y-6 sm:space-y-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display-md text-4xl text-primary sm:text-5xl">Activities</h1><p className="mt-3 text-sm leading-relaxed text-secondary">Follow your wedding planning progress and share updates with your family.</p></div><Link href="/activities/new" className={primaryAction}><Icon name="add" />Add update</Link></div>
    {deleted && <p role="status" className="rounded-xl bg-secondary-container p-4 text-sm">Update deleted successfully.</p>}<ActivityNotice />
    <form aria-label="Activity filters" onSubmit={event => { event.preventDefault(); apply("search", search.trim()); }} className={`${activityCard} grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_1fr_1fr_auto]`}>
      <input aria-label="Search activities" placeholder="Search activity titles and descriptions" maxLength={120} value={search} onChange={event => searchChanged(event.target.value)} className={`${activityInput} bg-surface-container-low`} />
      <select aria-label="Filter by source" value={params.get("sourceType") ?? ""} onChange={event => apply("sourceType", event.target.value)} className={`${activityInput} bg-surface-container-low`}><option value="">All updates</option><option value="MANUAL">Manual updates</option><option value="SYSTEM">Automatic updates</option></select>
      <select aria-label="Filter by event" value={params.get("relatedEventId") ?? ""} onChange={event => apply("relatedEventId", event.target.value)} className={`${activityInput} bg-surface-container-low`}><option value="">All events</option><option value="wedding-wide">Wedding-wide</option>{(lastData?.events ?? []).map(event => <option key={event.id} value={event.id}>{event.name}</option>)}</select>
      <button type="button" onClick={clear} className={`${secondaryAction} whitespace-nowrap`}>Clear filters</button><button type="submit" className="sr-only">Search</button>
    </form>
    {state.status === "loading" ? <ActivitySkeleton /> : state.status === "error" ? <ActivityFailure expired={state.expired} retry={reload} /> : <>
      {state.data.activities.length ? <div className="space-y-8">{Array.from(groups, ([day, activities]) => <section key={day} className="space-y-4" aria-label={day}><div className="flex flex-wrap items-center gap-3"><Icon name="calendar_month" className="text-xl text-primary" /><h2 className="text-lg font-semibold">{day}</h2><span aria-hidden="true" className="hidden h-px flex-1 bg-outline-variant/30 sm:block" /><p className="text-xs text-secondary">{activities.length} {activities.length === 1 ? "update" : "updates"} on this page</p></div>{activities.map(activity => <ActivityItem key={activity.id} activity={activity} />)}</section>)}</div>
      : <div className={`${activityCard} py-12 text-center`}><Icon name="history_edu" className="text-4xl text-primary" /><h2 className="mt-4 font-display-md text-2xl text-primary">{filtered ? "No updates match your filters" : "No activity yet"}</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-secondary">{filtered ? "Try another search or clear your filters to see your saved updates." : "Share your first update. New events, completed tasks, added expenses and guest changes will appear here automatically."}</p>{filtered ? <button type="button" onClick={clear} className={`${secondaryAction} mt-6`}>View all updates</button> : <Link href="/activities/new" className={`${primaryAction} mt-6`}>Add your first update</Link>}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-5 text-xs text-secondary"><p>Showing {state.data.activities.length ? (state.data.pagination.page - 1) * state.data.pagination.limit + 1 : 0}–{state.data.activities.length ? (state.data.pagination.page - 1) * state.data.pagination.limit + state.data.activities.length : 0} of {state.data.pagination.total} updates</p><nav aria-label="Activity pagination" className="flex flex-wrap items-center gap-3"><button type="button" disabled={state.data.pagination.page <= 1} onClick={() => page(state.data.pagination.page - 1)} className={`${secondaryAction} disabled:opacity-40`}>Previous</button><span>Page {state.data.pagination.page} of {Math.max(1, state.data.pagination.pages)}</span><button type="button" disabled={state.data.pagination.page >= state.data.pagination.pages} onClick={() => page(state.data.pagination.page + 1)} className={`${secondaryAction} disabled:opacity-40`}>Next</button></nav></div>
    </>}
  </div>;
}
