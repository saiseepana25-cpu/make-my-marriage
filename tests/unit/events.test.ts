import { expect, test } from "vitest";
import { eventPatch, parseEventInput } from "@/features/events/requests";
import { dateTimeFields, scheduleInstant } from "@/features/events/dates";

const input = { name: " Haldi ", venue: " Family courtyard ", startAt: "2027-02-28T10:00:00+05:30" };
test("event requests normalize time zones and ignore scope/author injection", () => {
  expect(parseEventInput({ ...input, weddingId: "forged", createdBy: "forged" })).toMatchObject({ name: "Haldi", venue: "Family courtyard", startAt: "2027-02-28T04:30:00.000Z" });
  expect(eventPatch({ name: "Mehendi", weddingId: "forged", createdBy: "forged", coverImage: "unsupported" })).toEqual({ name: "Mehendi" });
});
test.each(["2027-02-30T10:00:00Z", "2027-02-28T24:00:00Z", "2027-02-28T10:70:00Z", "2027-02-28T10:00:00", "invalid"])("invalid event instant %s is rejected", startAt => {
  expect(() => parseEventInput({ ...input, startAt })).toThrow();
});
test("end ordering uses normalized instants and optional fields can be cleared", () => {
  expect(() => parseEventInput({ ...input, endAt: "2027-02-28T04:29:00Z" })).toThrow("Validation failed");
  expect(parseEventInput({ ...input, endAt: null, description: "" }).endAt).toBeUndefined();
  expect(parseEventInput({ ...input, endAt: "2027-03-01T00:00:00+05:30" }).endAt).toBe("2027-02-28T18:30:00.000Z");
});
test.each(["javascript:alert(1)", "http://example.com", "https://user:pass@example.com"])("unsafe livestream URL %s is rejected", livestreamUrl => {
  expect(() => parseEventInput({ ...input, livestreamUrl })).toThrow();
});
test("IST form conversion handles midnight, leap days, and invalid calendar dates", () => {
  expect(scheduleInstant("2028-02-29", "00:15")).toBe("2028-02-28T18:45:00.000Z");
  expect(dateTimeFields("2028-02-28T18:45:00.000Z")).toEqual({ date: "2028-02-29", time: "00:15" });
  expect(scheduleInstant("2027-02-29", "10:00")).toBeUndefined();
  expect(scheduleInstant("2027-02-28", "24:00")).toBeUndefined();
});
