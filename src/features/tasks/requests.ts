import { isRecord, requireObjectId, validationError } from "@/lib/api/validation";
import { TASK_PRIORITIES, TASK_STATUSES, type TaskStatus } from "@/types/domain";
import type { TaskInput } from "./types";

const fields = ["title", "description", "eventId", "dueAt", "priority", "status"] as const;
export function taskPatch(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) validationError("Task details must be an object.");
  if (Object.hasOwn(input, "assignedTo")) validationError("Individual task assignment is not available yet.");
  return Object.fromEntries(fields.filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]]));
}
export function taskStatus(value: unknown): TaskStatus {
  if (typeof value !== "string" || !TASK_STATUSES.includes(value as TaskStatus)) validationError("Choose To do, In progress, or Completed.");
  return value as TaskStatus;
}
export function taskDeadline(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,3})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.test(value)) {
    validationError("Deadline must be a valid date and time with a time zone.");
  }
  const date = new Date(value);
  const calendar = value.slice(0, 10);
  const day = new Date(`${calendar}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(day.getTime()) || day.toISOString().slice(0, 10) !== calendar) validationError("Choose a valid deadline.");
  return date.toISOString();
}
export function parseTaskInput(input: unknown): TaskInput {
  const values = taskPatch(input);
  if (typeof values.title !== "string" || !values.title.trim() || values.title.trim().length > 120) validationError("Enter a task title (up to 120 characters).");
  let description: string | undefined;
  if (values.description != null && values.description !== "") {
    if (typeof values.description !== "string" || values.description.trim().length > 5000) validationError("Enter a description (up to 5000 characters).");
    description = values.description.trim() || undefined;
  }
  const priority = values.priority === undefined ? "MEDIUM" : values.priority;
  if (typeof priority !== "string" || !TASK_PRIORITIES.includes(priority as TaskInput["priority"])) validationError("Choose Low, Medium, or High priority.");
  const eventId = values.eventId == null || values.eventId === "" ? undefined : requireObjectId(values.eventId, "eventId");
  return { title: values.title.trim(), description, eventId, dueAt: taskDeadline(values.dueAt),
    priority: priority as TaskInput["priority"], status: taskStatus(values.status === undefined ? "TODO" : values.status) };
}
