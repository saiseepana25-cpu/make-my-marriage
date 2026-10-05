import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getPageEvent } from "@/features/events/page-data";
import { getCurrentWedding } from "@/features/weddings/service";
import { eventDate, eventTiming } from "@/features/events/dates";
import { Icon } from "@/components/marketing/icon";
import { BackToEvents, primaryAction } from "@/components/events/event-ui";
import { DeleteEventButton } from "@/components/events/delete-event-button";

export const metadata: Metadata = { title: "Event details", robots: { index: false, follow: false } };
export default async function Page({ params, searchParams }: { params: Promise<{ eventId: string }>; searchParams: Promise<{ saved?: string }> }) {
  const user = await requirePageUser();
  const [{ event, asOf }, wedding, search] = await Promise.all([getPageEvent((await params).eventId), getCurrentWedding(), searchParams]);
  const manage = hasPermission(user.role, "events:manage");
  const past = new Date(event.endAt || event.startAt).getTime() < asOf;
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><BackToEvents />
      {manage && <div className="flex flex-wrap items-center gap-3"><DeleteEventButton id={event.id} name={event.name} /><Link href={`/events/${event.id}/edit`} className={primaryAction}><Icon name="edit" />Edit event</Link></div>}
    </div>
    {(search.saved === "created" || search.saved === "updated") && <p role="status" className="rounded-xl bg-secondary-container p-4 text-sm">Event {search.saved === "created" ? "created" : "updated"} successfully.</p>}
    <article className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      <div className="space-y-5 bg-gradient-to-r from-surface-container-low via-surface-container-lowest to-surface-container-low p-5 sm:p-8 lg:p-10">
        <span className="inline-flex rounded-full bg-secondary-container px-3 py-1 text-xs text-on-secondary-container">{past ? "Past event" : new Date(event.startAt).getTime() <= asOf ? "In progress" : "Upcoming celebration"}</span>
        <div className="flex flex-wrap items-end justify-between gap-4"><h1 className="max-w-full break-words font-display-md text-[32px] leading-tight text-primary sm:text-4xl">{event.name}</h1><p className="text-sm text-on-surface-variant">{wedding.groomName} &amp; {wedding.brideName}</p></div>
        <dl className="grid gap-5 rounded-xl bg-secondary-container/60 p-5 sm:grid-cols-2">
          <div className="flex items-start gap-3"><Icon name="calendar_month" className="mt-1 text-2xl text-primary-container" /><div><dt className="text-xs text-on-secondary-container">Date</dt><dd className="mt-1 font-semibold">{eventDate(event.startAt, { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</dd></div></div>
          <div className="flex items-start gap-3"><Icon name="schedule" className="mt-1 text-2xl text-primary-container" /><div><dt className="text-xs text-on-secondary-container">Timing</dt><dd className="mt-1 font-semibold">{eventTiming(event)}</dd></div></div>
        </dl>
      </div>
      <div className="grid gap-7 p-5 sm:p-8 lg:grid-cols-2 lg:p-10">
        <section aria-labelledby="venue-title"><h2 id="venue-title" className="mb-4 flex items-center gap-2 text-lg font-semibold"><Icon name="location_on" className="text-primary-container" />Venue &amp; location</h2>
          <div className="space-y-5 rounded-xl bg-surface-container-low p-5"><div><p className="text-[11px] uppercase tracking-wider text-on-surface-variant">Venue</p><p className="mt-2 break-words text-lg font-semibold">{event.venue}</p></div>
            <div><p className="text-[11px] uppercase tracking-wider text-on-surface-variant">Address &amp; landmarks</p><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{event.location || "No address added yet."}</p></div>
          </div>
        </section>
        <section aria-labelledby="notes-title"><h2 id="notes-title" className="mb-4 flex items-center gap-2 text-lg font-semibold"><Icon name="history_edu" className="text-primary-container" />Description &amp; notes</h2><p className="min-h-40 whitespace-pre-wrap break-words rounded-xl bg-surface-container-low p-5 text-sm leading-relaxed">{event.description || "No notes added yet."}</p></section>
      </div>
      <div className="bg-surface-container-low px-5 py-4 text-xs text-on-surface-variant sm:px-8 lg:px-10">Part of {wedding.groomName} &amp; {wedding.brideName}’s shared wedding workspace.</div>
    </article>
  </div>;
}
