import "server-only";
import mongoose from "mongoose";
import { requirePermission, weddingScope } from "@/features/auth/authorization";
import { canUpdateTaskStatus } from "@/features/auth/permissions";
import { listEvents } from "@/features/events/service";
import { getCurrentWedding } from "@/features/weddings/service";
import { apiError } from "@/lib/api/response";
import { EventModel } from "@/models/event";
import { TaskModel } from "@/models/task";
import type { TaskPriority, TaskStatus } from "@/types/domain";
import type { DashboardEvents, DashboardSection, DashboardTasks } from "./types";

export async function dashboardOverview() {
  const [user, wedding] = await Promise.all([requirePermission("dashboard:read"), getCurrentWedding()]);
  return { user, wedding, asOf: Date.now() };
}

interface TaskAggregate {
  counts: { total: number; completed: number; overdue: number }[];
  attentionCount: { total: number }[];
  attention: { _id: mongoose.Types.ObjectId; title: string; status: TaskStatus; priority: TaskPriority;
    dueAt: Date; assignedTo?: mongoose.Types.ObjectId; event: { _id: mongoose.Types.ObjectId; name: string }[] }[];
}

export async function dashboardTasks(): Promise<DashboardTasks> {
  const user = await requirePermission("dashboard:read");
  const now = new Date();
  const approaching = new Date(now.getTime() + 7 * 86_400_000);
  const attention = { status: { $ne: "COMPLETED" }, dueAt: { $type: "date", $lte: approaching } };
  // One bounded aggregation keeps global counts independent of the preview limit.
  // Aggregations require explicit ObjectIds; Mongoose does not cast their filters.
  const [result] = await TaskModel.aggregate<TaskAggregate>([
    { $match: { weddingId: new mongoose.Types.ObjectId(user.weddingId) } },
    { $facet: {
      counts: [{ $group: { _id: null, total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
        overdue: { $sum: { $cond: [{ $and: [{ $ne: ["$status", "COMPLETED"] }, { $eq: [{ $type: "$dueAt" }, "date"] }, { $lt: ["$dueAt", now] }] }, 1, 0] } },
      } }],
      attentionCount: [{ $match: attention }, { $count: "total" }],
      attention: [{ $match: attention }, { $sort: { dueAt: 1, _id: 1 } }, { $limit: 3 },
        { $lookup: { from: EventModel.collection.name, let: { eventId: "$eventId", weddingId: "$weddingId" },
          pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$eventId"] }, { $eq: ["$weddingId", "$$weddingId"] }] } } }, { $project: { _id: 1, name: 1 } }], as: "event" } },
        { $project: { _id: 1, title: 1, status: 1, priority: 1, dueAt: 1, assignedTo: 1, event: 1 } }],
    } },
  ]);
  const counts = result?.counts[0] ?? { total: 0, completed: 0, overdue: 0 };
  return { counts: { total: counts.total, completed: counts.completed, unfinished: counts.total - counts.completed, overdue: counts.overdue },
    attentionTotal: result?.attentionCount[0]?.total ?? 0,
    attention: (result?.attention ?? []).map(task => ({ id: task._id.toString(), title: task.title, status: task.status,
      priority: task.priority, dueAt: task.dueAt.toISOString(),
      ...(task.event[0] ? { event: { id: task.event[0]._id.toString(), name: task.event[0].name } } : {}),
      canComplete: canUpdateTaskStatus(user, { ...weddingScope(user), assignedTo: task.assignedTo?.toString() }),
    })), asOf: now.getTime() };
}

export async function dashboardEvents(): Promise<DashboardEvents> {
  await requirePermission("dashboard:read");
  const result = await listEvents(new URLSearchParams("view=upcoming&limit=5"));
  return { events: result.events.map(event => ({ id: event.id, name: event.name, startAt: event.startAt, endAt: event.endAt, venue: event.venue })),
    upcoming: result.counts.upcoming, total: result.counts.upcoming + result.counts.past, asOf: result.asOf };
}

export async function dashboardSection<T>(load: () => Promise<T>, operation: string): Promise<DashboardSection<T>> {
  try { return { status: "ready", data: await load() }; }
  catch (error) {
    // Reuse sanitized diagnostic logging; never expose driver messages or query data.
    apiError(error, operation);
    return { status: "error", data: null };
  }
}
