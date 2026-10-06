import { expect, test } from "vitest";
import { parseTaskInput, taskDeadline, taskPatch, taskStatus } from "@/features/tasks/requests";
import { deadlineLabel, isOverdue } from "@/features/tasks/format";
import { scheduleInstant } from "@/features/events/dates";

test("task defaults and allowlist preserve one optional description without client scope", () => {
  expect(parseTaskInput({ title: "  Book venue  ", weddingId: "forged", createdBy: "forged", category: "fake" })).toEqual({ title: "Book venue", description: undefined, eventId: undefined, dueAt: undefined, priority: "MEDIUM", status: "TODO" });
  expect(taskPatch({ title: "Edit", weddingId: "fake" })).toEqual({ title: "Edit" });
  expect(parseTaskInput({ title: "Edit", description: "  ", eventId: null, dueAt: "" }).description).toBeUndefined();
});
test("invalid values and deferred assignment are rejected", () => {
  for (const body of [null, [], {}, { title: " " }, { title: "x".repeat(121) }, { title: "x", description: "x".repeat(5001) }, { title: "x", priority: "URGENT" }, { title: "x", status: "OVERDUE" }, { title: "x", eventId: "invalid" }, { title: "x", assignedTo: "anything" }]) expect(() => parseTaskInput(body)).toThrow();
  expect(() => taskStatus("OVERDUE")).toThrow();
});
test("deadline requires a real date and explicit offset; past and absent deadlines are valid", () => {
  expect(taskDeadline("2020-02-29T00:15:00+05:30")).toBe("2020-02-28T18:45:00.000Z");
  for (const value of ["2027-02-29T10:00:00Z", "2026-04-31T10:00:00Z", "2027-01-01", "2027-01-01T10:00:00", "2027-01-01T24:00:00Z", "bad"]) expect(() => taskDeadline(value)).toThrow();
  expect(scheduleInstant("2020-02-29", "00:15")).toBe("2020-02-28T18:45:00.000Z");
});
test("overdue is derived for unfinished tasks only and no-deadline tasks stay neutral", () => {
  const dueAt = "2026-10-01T00:00:00Z", now = new Date("2026-10-05T00:00:00Z").getTime();
  expect(isOverdue({ dueAt, status: "TODO" }, now)).toBe(true);
  expect(isOverdue({ dueAt, status: "COMPLETED" }, now)).toBe(false);
  expect(isOverdue({ status: "IN_PROGRESS" }, now)).toBe(false);
  expect(isOverdue({ dueAt, status: "TODO" }, new Date(dueAt).getTime())).toBe(false);
  expect(deadlineLabel()).toBe("No deadline"); expect(deadlineLabel(dueAt)).toContain("IST");
});
