import { eventDate, eventTime } from "@/features/events/dates";
import type { TaskPriority, TaskStatus } from "@/types/domain";
import type { WeddingTask } from "./types";

export const statusLabels: Record<TaskStatus, string> = { TODO: "To do", IN_PROGRESS: "In progress", COMPLETED: "Completed" };
export const priorityLabels: Record<TaskPriority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };
export function isOverdue(task: Pick<WeddingTask, "dueAt" | "status">, now: number) {
  return !!task.dueAt && new Date(task.dueAt).getTime() < now && task.status !== "COMPLETED";
}
export function deadlineLabel(dueAt?: string) {
  return dueAt ? `${eventDate(dueAt, { day: "numeric", month: "short", year: "numeric" })}, ${eventTime(dueAt)} IST` : "No deadline";
}
