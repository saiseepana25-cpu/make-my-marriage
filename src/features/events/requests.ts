import { isRecord, validationError } from "@/lib/api/validation";
import type { EventInput } from "./types";

const fields = ["name", "venue", "startAt", "endAt", "description", "location", "livestreamUrl", "status"] as const;

// Pick only documented mutable fields. Scope and authorship always come from the session.
export function eventPatch(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) validationError("Event details must be an object.");
  return Object.fromEntries(fields.filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
}

export function parseEventInput(input: unknown): EventInput {
  if (!isRecord(input)) validationError("Event details must be an object.");
  const values = input;
  function text(key: string, label: string, max: number, required = false) {
    const value = values[key];
    if (!required && (value == null || value === "")) return undefined;
    if (typeof value !== "string" || (required && !value.trim()) || value.trim().length > max) {
      validationError(`Enter ${label} (up to ${max} characters).`);
    }
    return value.trim() || undefined;
  }
  function instant(key: string, required = false) {
    const value = values[key];
    if (!required && (value == null || value === "")) return undefined;
    // Require an explicit offset so server/browser time zones cannot change the schedule.
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) {
      validationError(`${key} must be a valid date and time with a time zone.`);
    }
    const date = new Date(value);
    const calendar = value.slice(0, 10);
    const calendarDate = new Date(`${calendar}T00:00:00Z`);
    if (!Number.isFinite(date.getTime()) || !Number.isFinite(calendarDate.getTime()) || calendarDate.toISOString().slice(0, 10) !== calendar) {
      validationError(`${key} must be a valid date and time.`);
    }
    return date.toISOString();
  }
  const name = text("name", "an event name", 150, true)!;
  const venue = text("venue", "a venue name", 250, true)!;
  const startAt = instant("startAt", true)!;
  const endAt = instant("endAt");
  if (endAt && endAt < startAt) validationError("End time must be on or after the start time.");
  const livestreamUrl = text("livestreamUrl", "a livestream URL", 2000);
  if (livestreamUrl) {
    let url: URL;
    try { url = new URL(livestreamUrl); } catch { validationError("Enter a valid HTTPS livestream URL."); }
    if (url.protocol !== "https:" || url.username || url.password) validationError("Enter a valid HTTPS livestream URL.");
  }
  return { name, venue, startAt, endAt, livestreamUrl,
    description: text("description", "a description", 5000),
    location: text("location", "an address", 1000), status: text("status", "a status", 100),
  };
}
