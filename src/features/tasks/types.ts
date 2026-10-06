import type { TaskPriority, TaskStatus } from "@/types/domain";

export interface WeddingTask {
  id: string;
  weddingId: string;
  title: string;
  description?: string;
  eventId?: string;
  assignedTo?: string;
  dueAt?: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
export interface TaskInput {
  title: string;
  description?: string;
  eventId?: string;
  dueAt?: string;
  priority: TaskPriority;
  status: TaskStatus;
}
export interface TaskEventOption { id: string; name: string }
