"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { WorkspaceLink } from "@/components/layout/workspace-navigation";
import { Icon } from "@/components/marketing/icon";
import { hasPermission } from "@/features/auth/permissions";
import { guestWebsiteUrl, weddingDateLabel, publicEventTiming } from "@/features/website/format";
import { eventDate } from "@/features/events/dates";
import type { CurrentWedding } from "@/features/weddings/types";
import type { WeddingEvent } from "@/features/events/types";
import type { Role } from "@/types/domain";
import type { ApiResponse } from "@/types/api";
import { WebsiteComingSoon, WebsiteSkeleton, websiteCard, websitePrimary, websiteSecondary } from "./website-ui";

type Load<T> = { status: "loading" } | { status: "ready"; data: T } | { status: "error" | "expired" | "unavailable" };
function useSavedData<T>(url: string) {
  const [state, setState] = useState<Load<T>>({ status: "loading" });
  const current = useRef<AbortController | null>(null);
  const load = useCallback(() => {
    current.current?.abort(); const controller = new AbortController(); current.current = controller;
    void (async () => {
      try {
        const response = await fetch(url, { cache: "no-store", credentials: "same-origin", signal: controller.signal });
        const result = await response.json() as ApiResponse<T>;
        if (!controller.signal.aborted) setState(response.ok && result.success ? { status: "ready", data: result.data } : { status: response.status === 401 ? "expired" : response.status === 404 ? "unavailable" : "error" });
      } catch { if (!controller.signal.aborted) setState({ status: "error" }); }
    })();
  }, [url]);
  useEffect(() => { load(); return () => current.current?.abort(); }, [load]);
  return { state, retry: () => { setState({ status: "loading" }); load(); } };
}

function SavedDataFailure({ status, retry, events = false }: { status: "error" | "expired" | "unavailable"; retry: () => void; events?: boolean }) {
  return <div role="alert" className={`${websiteCard} text-center`}><h2 className="font-display-md text-2xl text-primary">{status === "expired" ? "Session expired" : status === "unavailable" ? "Wedding workspace unavailable" : events ? "Couldn’t load celebrations" : "Couldn’t load wedding website"}</h2><p className="mt-3 text-sm text-secondary">{status === "expired" ? "Please log in again." : status === "unavailable" ? "This wedding workspace is unavailable." : "Please try again to load your saved details."}</p><div className="mt-5 flex flex-wrap justify-center gap-3">{status === "expired" ? <WorkspaceLink href="/login" className={websitePrimary}>Log in</WorkspaceLink> : status === "error" ? <button type="button" className={websitePrimary} onClick={retry}>Retry{events ? " celebrations" : ""}</button> : null}<WorkspaceLink href="/dashboard" className={websiteSecondary}>Back to dashboard</WorkspaceLink></div></div>;
}

export function ShareGuestLink({ url }: { url: string }) {
  const [state, setState] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const pending = useRef(false), active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  async function copy() {
    if (pending.current) return;
    pending.current = true; setState("copying");
    try { await navigator.clipboard.writeText(url); if (active.current) setState("copied"); }
    catch { if (active.current) setState("failed"); }
    finally { pending.current = false; }
  }
  return <section className={websiteCard} aria-labelledby="share-link-heading"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="share-link-heading" className="text-xl font-semibold"><Icon name="link" className="mr-2 text-primary" />Shareable Guest Link</h2><p className="mt-2 text-sm text-secondary">Direct access for your wedding guests.</p></div><span className="rounded-full bg-surface-container-low px-3 py-1 text-[10px] font-semibold uppercase text-secondary">Public access</span></div>
    <div className="mt-6 rounded-2xl bg-surface-container-low p-4"><p className="text-[10px] font-semibold uppercase tracking-wider text-secondary">Direct URL</p><p className="mt-3 select-all break-all rounded-xl bg-surface-container-lowest p-4 font-mono text-sm" aria-label="Guest website URL">{url}</p><div className="mt-4 flex flex-wrap gap-3"><button type="button" className={websitePrimary} disabled={state === "copying"} onClick={() => void copy()}><Icon name="link" />{state === "copying" ? "Copying…" : state === "copied" ? "Copied!" : "Copy link"}</button><a href={url} target="_blank" rel="noopener noreferrer" className={websiteSecondary}>Open wedding website<Icon name="arrow_forward" /><span className="sr-only"> (opens in a new tab)</span></a></div>
      {state === "copied" && <p role="status" className="mt-4 text-sm text-primary">Link copied successfully.</p>}
      {state === "failed" && <div role="alert" className="mt-4 space-y-3"><p className="text-sm text-error">Couldn’t copy the link. Select and copy it manually below, or try Copy link again.</p><label htmlFor="manual-guest-link" className="block text-xs font-semibold">Link to copy manually</label><textarea id="manual-guest-link" readOnly value={url} rows={4} onFocus={event => event.currentTarget.select()} className="w-full resize-y rounded-xl border border-outline-variant bg-surface-container-lowest p-3 font-mono text-sm [overflow-wrap:anywhere]" /></div>}
    </div><p className="mt-5 rounded-xl bg-surface-container-low p-4 text-sm leading-relaxed text-on-surface-variant">Anyone with this link can view your wedding details and event schedule. No account or password is required.</p>
  </section>;
}

function WorkspaceCelebrations({ manage }: { manage: boolean }) {
  const { state, retry } = useSavedData<{ events: WeddingEvent[]; pagination: { total: number } }>("/api/v1/events?limit=3");
  return <section aria-labelledby="saved-celebrations-heading" className="mt-7 border-t border-outline-variant/30 pt-6"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h3 id="saved-celebrations-heading" className="text-sm font-semibold uppercase tracking-wider">Celebrations{state.status === "ready" && <span className="ml-3 text-xs font-normal normal-case text-secondary">{state.data.pagination.total} {state.data.pagination.total === 1 ? "ceremony" : "ceremonies"} configured</span>}</h3><WorkspaceLink href="/events" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary">{manage ? "Manage events" : "View events"}<Icon name="arrow_forward" /></WorkspaceLink></div>
    {state.status === "loading" ? <WebsiteSkeleton label="Loading saved celebrations" /> : state.status !== "ready" ? <SavedDataFailure status={state.status} retry={retry} events /> : state.data.events.length ? <div className="space-y-3">{state.data.events.map(event => <article key={event.id} className="rounded-xl bg-surface-container-low p-4"><h4 className="break-words font-semibold text-primary">{event.name}</h4><p className="mt-2 text-xs leading-relaxed text-secondary">{eventDate(event.startAt)} · {publicEventTiming(event)}</p><p className="mt-2 break-words text-sm text-secondary">{event.venue}{event.location ? ` — ${event.location}` : ""}</p>{event.livestreamUrl && <p className="mt-2 text-xs font-semibold text-primary">Livestream link configured</p>}</article>)}{state.data.pagination.total > state.data.events.length && <p className="text-xs text-secondary">Showing the first {state.data.events.length} celebrations. Open Events to view the full schedule.</p>}</div> : <div className="rounded-xl bg-surface-container-low p-6 text-center"><h4 className="font-semibold">No celebrations yet</h4><p className="mt-2 text-sm text-secondary">{manage ? "Add your first celebration in Events. It will appear on your wedding website." : "Celebrations will appear here when the wedding owner or an admin adds them."}</p>{manage && <WorkspaceLink href="/events/new" className={`${websitePrimary} mt-4`}>Add event</WorkspaceLink>}</div>}
  </section>;
}

export function WebsiteWorkspace({ role, origin }: { role: Role; origin: string }) {
  const { state, retry } = useSavedData<CurrentWedding>("/api/v1/weddings/current");
  const manage = hasPermission(role, "website:manage");
  if (state.status === "loading") return <WebsiteSkeleton />;
  if (state.status !== "ready") return <SavedDataFailure status={state.status} retry={retry} />;
  const wedding = state.data, couple = `${wedding.groomName} & ${wedding.brideName}`, date = weddingDateLabel(wedding.weddingDate), url = guestWebsiteUrl(origin, wedding.websiteSlug);
  return <div className="space-y-7"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-display-md text-4xl text-primary sm:text-5xl">Wedding Website</h1><p className="mt-3 text-sm leading-relaxed text-secondary">Share your wedding details and celebrations with your guests.</p></div><span className="rounded-full bg-surface-container-lowest px-4 py-2 text-xs font-semibold text-primary">Public link available</span></div>
    {!manage && <p className="rounded-2xl bg-secondary-container/50 p-5 text-sm text-primary">Only the wedding owner or an admin can edit wedding details and events. You can view and share the guest link.</p>}
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"><div className="min-w-0 space-y-6"><ShareGuestLink key={url} url={url} />
      <section className={websiteCard}><h2 className="text-xl font-semibold">Website Content Summary</h2><p className="mt-2 text-sm text-secondary">Compiled from your wedding workspace.</p><p className="mt-5 rounded-xl bg-surface-container-low p-4 text-xs leading-relaxed text-secondary">Uses your saved wedding details and events. Guests see updates when they open or refresh the page.</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold uppercase tracking-wider">Couple Details</h3>{manage && <WorkspaceLink href="/settings" className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-primary">Edit wedding details<Icon name="arrow_forward" /></WorkspaceLink>}</div>
        <dl className="mt-3 grid gap-5 rounded-2xl bg-surface-container-low p-5 sm:grid-cols-3">{[{ label: "Couple", value: couple }, { label: "Wedding date", value: date }, { label: "Primary location", value: wedding.location }].map(item => <div key={item.label} className="min-w-0"><dt className="text-[10px] font-semibold uppercase tracking-wider text-secondary">{item.label}</dt><dd className="mt-2 break-words text-sm font-semibold leading-relaxed">{item.value}</dd></div>)}</dl><WorkspaceCelebrations manage={manage} />
      </section>
    </div><div className="min-w-0 space-y-6"><aside aria-label="Guest View Preview" className={websiteCard}><h2 className="text-xl font-semibold">Guest View Preview</h2><p className="mt-2 text-sm text-secondary">A preview of your saved wedding details.</p><div className="mt-5 rounded-2xl border border-outline-variant/40 bg-surface-container-low p-5"><p className="text-[10px] font-semibold uppercase tracking-widest text-primary">Wedding celebration</p><p className="mt-6 break-words font-display-md text-3xl leading-relaxed text-primary">{couple}</p><p className="mt-5 flex items-start gap-2 text-sm leading-relaxed"><Icon name="calendar_month" className="mt-1 text-primary" /><span>{date}</span></p><p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-secondary"><Icon name="location_on" className="mt-1" /><span className="min-w-0 break-words">{wedding.location}</span></p></div></aside>
      <WebsiteComingSoon stacked /><p className="rounded-2xl bg-surface-container-low p-5 text-xs leading-relaxed text-secondary">Share this link in your invitations. Guests see your latest saved wedding details and events when they open or refresh the page. You can keep sharing the same link.</p>
    </div></div>
  </div>;
}
