import { isRecord, validationError } from "@/lib/api/validation";
import { RSVP_STATUSES, type RsvpStatus } from "@/types/domain";
import type { GuestInput } from "./types";

const fields = ["name", "phone", "email", "familyName", "numberInvited", "numberAttending", "rsvpStatus", "notes"] as const;
export const validGuestCount = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
export const validGuestEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export function guestPatch(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) validationError("Guest details must be an object.");
  return Object.fromEntries(fields.filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
}
function text(value: unknown, label: string, max: number, required = false) {
  if (value == null || value === "") { if (required) validationError(`Enter ${label}.`); return undefined; }
  if (typeof value !== "string" || value.trim().length > max || (required && !value.trim())) validationError(`Enter ${label} (up to ${max} characters).`);
  return value.trim() || undefined;
}
function count(value: unknown, label: string) {
  if (value == null || value === "") return undefined;
  if (!validGuestCount(value)) validationError(`${label} must be a whole number of zero or more.`);
  return value;
}
export function parseGuestInput(input: unknown): GuestInput {
  const values = guestPatch(input);
  const name = text(values.name, "a guest name", 120, true)!;
  const email = text(values.email, "an email address", 254)?.toLowerCase();
  if (email && !validGuestEmail(email)) validationError("Enter a valid email address or leave it blank.");
  if (!RSVP_STATUSES.includes(values.rsvpStatus as RsvpStatus)) validationError("Choose Pending, Attending or Not attending.");
  return { name, email, phone: text(values.phone, "a phone number", 80), familyName: text(values.familyName, "a family name", 120),
    numberInvited: count(values.numberInvited, "Number invited"), numberAttending: count(values.numberAttending, "Number attending"),
    rsvpStatus: values.rsvpStatus as RsvpStatus, notes: text(values.notes, "notes", 5000) };
}
