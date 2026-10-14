import { dateTimeFields, eventDate, eventTime } from "@/features/events/dates";
import { weddingCountdown } from "@/features/dashboard/format";
import type { PublicEvent } from "./types";

export function validWebsiteSlug(slug: string): boolean {
  return slug.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

export function websiteOrigin(value: string, production = false): string {
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.username || url.password || (url.protocol !== "https:" && (production || url.protocol !== "http:" || !local))) {
    throw new Error("Invalid application origin.");
  }
  return url.origin;
}

export function guestWebsiteUrl(origin: string, slug: string): string {
  if (!validWebsiteSlug(slug)) throw new Error("Invalid wedding website slug.");
  return `${websiteOrigin(origin)}/wedding/${encodeURIComponent(slug)}`;
}

export function weddingDateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export function guestCountdown(value: string, asOf: number): string {
  const label = weddingCountdown(value, asOf);
  return label === "Today is your wedding day" ? "Today is the wedding day"
    : label === "Our wedding" ? "Celebrating our wedding memories"
    : label.replace(" to go", " until the wedding");
}

export function publicEventTiming(event: Pick<PublicEvent, "startAt" | "endAt">): string {
  if (!event.endAt) return `${eventTime(event.startAt)} IST`;
  if (dateTimeFields(event.startAt).date === dateTimeFields(event.endAt).date) {
    return `${eventTime(event.startAt)} – ${eventTime(event.endAt)} IST`;
  }
  return `${eventDate(event.startAt, { dateStyle: "full" })}, ${eventTime(event.startAt)} IST – ${eventDate(event.endAt, { dateStyle: "full" })}, ${eventTime(event.endAt)} IST`;
}

export function venueMapUrl(event: Pick<PublicEvent, "venue" | "location">): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([event.venue, event.location].filter(Boolean).join(", "))}`;
}

export function safeLivestreamUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}
