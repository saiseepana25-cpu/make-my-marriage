import type { WeddingEvent } from "./types";

export const EVENT_TIME_ZONE = "Asia/Kolkata";
export function eventDate(value: string, options: Intl.DateTimeFormatOptions = { dateStyle: "long" }) {
  return new Intl.DateTimeFormat("en-IN", { ...options, timeZone: EVENT_TIME_ZONE }).format(new Date(value));
}
export function eventTime(value: string) {
  return eventDate(value, { hour: "numeric", minute: "2-digit", hour12: true });
}
export function eventTiming(event: WeddingEvent) {
  if (!event.endAt) return `${eventTime(event.startAt)} IST`;
  const endDay = dateTimeFields(event.endAt).date;
  const startDay = dateTimeFields(event.startAt).date;
  return `${eventTime(event.startAt)} – ${endDay !== startDay ? `${eventDate(event.endAt, { day: "numeric", month: "short" })}, ` : ""}${eventTime(event.endAt)} IST`;
}
export function dateTimeFields(value: string) {
  const local = new Date(new Date(value).getTime() + 330 * 60_000).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}
export function scheduleInstant(date: string, time: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time)) return undefined;
  const value = new Date(`${date}T${time}:00+05:30`);
  if (!Number.isFinite(value.getTime()) || dateTimeFields(value.toISOString()).date !== date) return undefined;
  return value.toISOString();
}
