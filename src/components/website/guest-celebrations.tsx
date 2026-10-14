"use client";
import { useEffect, useRef, useState } from "react";
import type { ApiResponse } from "@/types/api";
import type { WebsiteEvents } from "@/features/website/types";
import { GuestEventCard, GuestVenues, websitePrimary } from "./website-ui";

export function GuestCelebrations({ slug, initial }: { slug: string; initial: WebsiteEvents | null }) {
  const [data, setData] = useState(initial), [failed, setFailed] = useState(!initial), [loading, setLoading] = useState(false);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function load() {
    if (request.current) return;
    const controller = new AbortController(); request.current = controller;
    const page = data ? data.pagination.page + 1 : 1;
    setLoading(true); setFailed(false);
    try {
      const response = await fetch(`/api/v1/public/weddings/${encodeURIComponent(slug)}/events?page=${page}&limit=${data?.pagination.limit ?? 3}`, { cache: "no-store", credentials: "omit", signal: controller.signal });
      const result = await response.json() as ApiResponse<WebsiteEvents>;
      if (!response.ok || !result.success) throw new Error("Unable to load celebrations.");
      if (!controller.signal.aborted) setData(previous => ({ ...result.data, events: [...new Map([...(previous?.events ?? []), ...result.data.events].map(event => [event.id, event])).values()] }));
    } catch { if (!controller.signal.aborted) setFailed(true); }
    finally { if (!controller.signal.aborted) { setLoading(false); request.current = null; } }
  }
  return <>
    <section id="celebrations" aria-labelledby="celebrations-heading" className="px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl"><div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Sacred itinerary</p><h2 id="celebrations-heading" className="mt-3 font-display-md text-3xl text-primary sm:text-4xl">Celebrations &amp; Ceremonies</h2><p className="mt-3 text-sm leading-relaxed text-secondary">Join us for our wedding events. All times in Indian Standard Time (IST).</p></div>
        <div className="mt-10 space-y-5">{data?.events.map(event => <GuestEventCard key={event.id} event={event} />)}</div>
        {data && !data.events.length && <div className="mt-8 rounded-3xl bg-surface-container-lowest px-6 py-12 text-center"><h3 className="font-display-md text-2xl text-primary">Celebrations are being planned</h3><p className="mt-3 text-sm text-secondary">The wedding schedule will appear here when it is ready.</p></div>}
        {failed && <div role="alert" className="mt-7 rounded-2xl bg-surface-container-lowest p-6 text-center"><h3 className="text-lg font-semibold text-primary">{data ? "Couldn’t load more celebrations" : "Couldn’t load celebrations"}</h3><p className="mt-3 text-sm text-secondary">Please try again in a moment.</p><button type="button" className={`${websitePrimary} mt-5`} disabled={loading} onClick={() => void load()}>Retry celebrations</button></div>}
        {loading && <p role="status" className="mt-7 text-center text-sm text-secondary">Loading celebrations…</p>}
        {data && data.pagination.page < data.pagination.pages && !failed && <div className="mt-9 text-center"><button type="button" className={websitePrimary} disabled={loading} onClick={() => void load()}>{loading ? "Loading more celebrations…" : "Load more celebrations"}</button></div>}
      </div>
    </section><GuestVenues events={data?.events ?? []} />
  </>;
}
