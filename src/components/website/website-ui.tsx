import type { ReactNode } from "react";
import { Icon } from "@/components/marketing/icon";
import { eventDate } from "@/features/events/dates";
import { publicEventTiming, safeLivestreamUrl, venueMapUrl } from "@/features/website/format";
import type { PublicEvent } from "@/features/website/types";

export const websiteCard = "min-w-0 rounded-3xl bg-surface-container-lowest p-6 shadow-sm sm:p-8";
export const websitePrimary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary disabled:opacity-50";
export const websiteSecondary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-outline-variant/60 bg-surface-container-lowest px-5 py-3 text-sm font-semibold text-primary disabled:opacity-50";

export function ExternalLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-surface-container-low px-4 py-2 text-xs font-semibold text-primary ${className}`}>
    {children}<Icon name="arrow_forward" /><span className="sr-only"> (opens in a new tab)</span>
  </a>;
}

export function WebsiteSkeleton({ label = "Loading wedding website" }: { label?: string }) {
  return <div role="status" aria-label={label} className={`${websiteCard} space-y-6`}><span className="sr-only">{label}…</span>
    <div aria-hidden="true" className="space-y-6 motion-safe:animate-pulse"><div className="h-8 w-2/3 rounded bg-surface-container" /><div className="h-4 w-4/5 rounded bg-surface-container-low" />{[0, 1, 2].map(key => <div key={key} className="h-16 rounded-xl bg-surface-container-low" />)}</div>
  </div>;
}

export function WebsiteComingSoon({ stacked = false }: { stacked?: boolean }) {
  return <div className={`grid gap-5 ${stacked ? "" : "sm:grid-cols-2"}`}>
    {[{ name: "Online RSVP", text: "Online RSVP will be available here soon.", icon: "mail" }, { name: "Wedding Gallery", text: "Wedding photos will be available here soon.", icon: "photo_library" }].map(item => <section key={item.name} className={`${websiteCard} text-center`}>
      <Icon name={item.icon as "mail" | "photo_library"} className="text-2xl text-primary" /><div className="mt-4 flex flex-wrap items-center justify-center gap-2"><h2 className="text-lg font-semibold">{item.name}</h2><span className="rounded-full bg-secondary-container px-3 py-1 text-[11px] text-on-secondary-container">Coming soon</span></div><p className="mt-3 text-sm leading-relaxed text-secondary">{item.text}</p>
    </section>)}
  </div>;
}

export function GuestEventCard({ event }: { event: PublicEvent }) {
  const livestream = safeLivestreamUrl(event.livestreamUrl);
  return <article className={`${websiteCard} grid gap-5 sm:grid-cols-[150px_minmax(0,1fr)]`}>
    <div><p className="text-xs font-semibold uppercase tracking-widest text-secondary">{eventDate(event.startAt, { weekday: "long" })}</p><p className="mt-2 font-display-md text-2xl text-primary"><time dateTime={event.startAt}>{eventDate(event.startAt, { day: "numeric", month: "short", year: "numeric" })}</time></p></div>
    <div className="min-w-0"><h3 className="break-words text-xl font-semibold text-primary">{event.name}</h3><p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-secondary"><Icon name="schedule" className="mt-1" /><span>{publicEventTiming(event)}</span></p>
      <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-secondary"><Icon name="location_on" className="mt-1" /><span className="break-words">{event.venue}{event.location ? ` — ${event.location}` : ""}</span></p>
      {event.description && <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-on-surface-variant">{event.description}</p>}
      <div className="mt-5 flex flex-wrap gap-3"><ExternalLink href={venueMapUrl(event)}>Open in Maps</ExternalLink>{livestream && <ExternalLink href={livestream}>Watch livestream</ExternalLink>}</div>
    </div>
  </article>;
}

export function GuestVenues({ events }: { events: PublicEvent[] }) {
  if (!events.length) return null;
  // Venues follow the loaded celebrations so large weddings remain bounded.
  return <section id="venues" aria-labelledby="venues-heading" className="bg-surface-container-low px-5 py-14 sm:px-8 sm:py-20">
    <div className="mx-auto max-w-6xl"><div className="text-center"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">Destinations</p><h2 id="venues-heading" className="mt-3 font-display-md text-3xl text-primary sm:text-4xl">Venue Information</h2><p className="mt-3 text-sm text-secondary">Locations for the celebrations shown above, with easy directions.</p></div>
      <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{events.map(event => <article key={event.id} className={`${websiteCard} flex flex-col`}><p className="break-words text-[10px] font-semibold uppercase tracking-wider text-primary">{event.name}</p><h3 className="mt-3 break-words text-xl font-semibold">{event.venue}</h3>{event.location && <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-secondary">{event.location}</p>}<ExternalLink href={venueMapUrl(event)} className="mt-5">Open in Google Maps</ExternalLink></article>)}</div>
    </div>
  </section>;
}
