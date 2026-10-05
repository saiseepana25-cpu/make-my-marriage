import type { Metadata } from "next";
import Link from "next/link";
import { requirePageUser } from "@/features/auth/current-user";
import { hasPermission } from "@/features/auth/permissions";
import { getCurrentWedding } from "@/features/weddings/service";
import { listEvents } from "@/features/events/service";
import { eventDate, eventTiming } from "@/features/events/dates";
import { Icon } from "@/components/marketing/icon";
import { ceremonies, EventIllustration, primaryAction, secondaryAction } from "@/components/events/event-ui";

export const metadata: Metadata = { title: "Wedding events", robots: { index: false, follow: false } };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requirePageUser();
  const params = await searchParams;
  const view = params.view === "past" ? "past" : "upcoming";
  const search = new URLSearchParams({ view });
  if (typeof params.page === "string") search.set("page", params.page);
  const [wedding, result] = await Promise.all([getCurrentWedding(), listEvents(search)]);
  const manage = hasPermission(user.role, "events:manage");
  const totalEvents = result.counts.upcoming + result.counts.past;
  const { page, pages } = result.pagination;
  const couple = `${wedding.groomName} & ${wedding.brideName}`;
  return <div className="space-y-6">
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div><p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">{couple} <span aria-hidden="true">·</span> Celebration itinerary</p>
        <h1 className="font-display-md text-[32px] leading-tight text-primary sm:text-4xl">Wedding Events</h1>
        <p className="mt-3 max-w-2xl text-sm text-on-surface-variant">Organize each ceremony and gathering for {couple} in chronological order.</p>
      </div>
      {manage && totalEvents > 0 && <Link href="/events/new" className={`${primaryAction} self-start sm:shrink-0`}><Icon name="add" className="text-xl" />Add Event</Link>}
    </div>
    {params.deleted === "1" && <p role="status" className="rounded-xl bg-secondary-container p-4 text-sm">Event deleted. Your linked planning records have been preserved.</p>}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-2">
      <nav aria-label="Event views" className="flex gap-1">
        {(["upcoming", "past"] as const).map(tab => <Link key={tab} href={`/events?view=${tab}`} aria-current={view === tab ? "page" : undefined}
          className={`rounded-xl px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${view === tab ? "bg-primary-container text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-container"}`}>
          {tab === "upcoming" ? "Upcoming Events" : "Past Events"} ({result.counts[tab]})
        </Link>)}
      </nav>
      <span className="hidden px-3 text-xs text-on-surface-variant sm:block">{totalEvents} {totalEvents === 1 ? "ceremony" : "ceremonies"} scheduled <span aria-hidden="true">·</span> IST</span>
    </div>
    {result.events.length === 0 ? <section className="relative overflow-hidden rounded-[20px] bg-surface-container-lowest px-5 py-12 text-center shadow-sm sm:px-10 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-fixed/25 to-transparent" />
      <div className="relative mx-auto flex max-w-xl flex-col items-center"><EventIllustration />
        <h2 className="mt-6 font-display-md text-[28px] leading-snug">{totalEvents === 0 ? "No wedding events added yet" : page > 1 ? "No events on this page" : view === "past" ? "No past events yet" : "No upcoming events"}</h2>
        <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">{totalEvents === 0 ? "Start bringing your wedding timeline together. Add ceremonies like Haldi, Mehendi, Sangeet, Wedding, and Reception so your family stays in sync on dates, times, and venues." : "Your ceremonies stay here before, during, and after the wedding. Switch views to see the rest of your schedule."}</p>
        {manage && <Link href="/events/new" className={`${primaryAction} mt-6`}><Icon name="add" className="text-xl" />{totalEvents === 0 ? "Add your first event" : "Add Event"}</Link>}
        {page > 1 && <Link href={`/events?view=${view}`} className={`${secondaryAction} mt-4`}>Back to the first page</Link>}
        {manage && totalEvents === 0 && <div className="mt-9 w-full rounded-2xl bg-surface-container-low p-5"><p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">Popular ceremony ideas</p>
          <div className="flex flex-wrap justify-center gap-2">{ceremonies.map(name => <Link key={name} href={`/events/new?name=${encodeURIComponent(name)}`} className="rounded-full bg-surface-container-lowest px-4 py-2 text-xs hover:bg-primary-fixed">{name} +</Link>)}</div>
        </div>}
      </div>
    </section> : <div className="space-y-4">{result.events.map(event => <article key={event.id} className="flex min-w-0 flex-col gap-5 rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 xl:flex-row xl:items-center">
      <div className="flex shrink-0 items-center justify-between gap-4 rounded-xl bg-surface-container-low px-4 py-3 xl:w-32 xl:flex-col xl:gap-1 xl:py-5">
        <span className="text-xs uppercase text-on-surface-variant">{eventDate(event.startAt, { weekday: "short" })}</span>
        <span className="font-display-md text-3xl text-primary">{eventDate(event.startAt, { day: "2-digit" })}</span>
        <span className="text-xs text-on-surface-variant">{eventDate(event.startAt, { month: "short", year: "numeric" })}</span>
      </div>
      <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="min-w-0 break-words text-lg font-semibold"><Link href={`/events/${event.id}`} className="hover:text-primary">{event.name}</Link></h2>
        <span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] text-on-secondary-container">{view === "past" ? "Past event" : new Date(event.startAt).getTime() <= result.asOf ? "In progress" : "Upcoming"}</span></div>
        <div className="mt-3 flex flex-col gap-2 text-sm text-on-surface-variant sm:flex-row sm:flex-wrap sm:gap-x-5"><p className="flex items-center gap-2"><Icon name="schedule" className="text-lg text-primary-container" />{eventTiming(event)}</p><p className="flex min-w-0 items-center gap-2"><Icon name="location_on" className="text-lg" /><span className="break-words">{event.venue}</span></p></div>
        {event.description && <p className="mt-3 line-clamp-2 break-words text-sm leading-relaxed text-on-surface-variant">{event.description}</p>}
        <div className="mt-5 flex justify-end gap-2">{manage && <Link href={`/events/${event.id}/edit`} className={secondaryAction}>Edit</Link>}<Link href={`/events/${event.id}`} className={primaryAction}>View Details</Link></div>
      </div>
    </article>)}</div>}
    {pages > 1 && <nav aria-label="Events pagination" className="flex items-center justify-between gap-4 text-sm">
      {page > 1 ? <Link className={secondaryAction} href={`/events?view=${view}&page=${page - 1}`}>Previous</Link> : <span />}
      <p className="text-on-surface-variant">Page {page} of {pages}</p>
      {page < pages ? <Link className={secondaryAction} href={`/events?view=${view}&page=${page + 1}`}>Next</Link> : <span />}
    </nav>}
  </div>;
}
