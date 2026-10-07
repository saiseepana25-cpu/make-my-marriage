import type { TaskPriority, TaskStatus } from "@/types/domain";

export interface DashboardTask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  event?: { id: string; name: string };
  canComplete: boolean;
}
export interface DashboardTasks {
  counts: { total: number; completed: number; unfinished: number; overdue: number };
  attention: DashboardTask[];
  attentionTotal: number;
  asOf: number;
}
export interface DashboardEvents {
  events: { id: string; name: string; startAt: string; endAt?: string; venue: string }[];
  total: number;
  upcoming: number;
  asOf: number;
}
export type DashboardSection<T> = { status: "ready"; data: T } | { status: "error"; data: null };
