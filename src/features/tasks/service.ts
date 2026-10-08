import "server-only";
import mongoose from "mongoose";
import { requirePermission, weddingScope } from "@/features/auth/authorization";
import { canUpdateTaskStatus } from "@/features/auth/permissions";
import { AppError } from "@/lib/api/errors";
import { isRecord, pagination, requireObjectId, validationError } from "@/lib/api/validation";
import { EventModel } from "@/models/event";
import { TaskModel, type TaskRecord } from "@/models/task";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";
import { ensureActivityIndexes, recordSystemActivity } from "@/features/activities/record";
import { TASK_PRIORITIES, type CurrentUser, type TaskPriority } from "@/types/domain";
import { parseTaskInput, taskDeadline, taskPatch, taskStatus } from "./requests";
import type { TaskEventOption, WeddingTask } from "./types";

function serialize(task: TaskRecord & { _id: mongoose.Types.ObjectId }): WeddingTask {
  return { id: task._id.toString(), weddingId: task.weddingId.toString(), title: task.title,
    description: task.description ?? undefined, eventId: task.eventId?.toString(), assignedTo: task.assignedTo?.toString(),
    dueAt: task.dueAt?.toISOString(), priority: task.priority, status: task.status,
    createdBy: task.createdBy.toString(), createdAt: task.createdAt.toISOString(), updatedAt: task.updatedAt.toISOString() };
}
const missing = () => new AppError("NOT_FOUND", "This task could not be found in your wedding workspace.", 404);
async function limit(user: CurrentUser) {
  await enforceRateLimit({ scope: "tasks", key: `user:${user.id}`, limit: 60, windowSeconds: 60 });
  await ensureActivityIndexes();
}
async function mutationUser() { const user = await requirePermission("tasks:manage"); await limit(user); return user; }

export async function taskEventOptions(): Promise<TaskEventOption[]> {
  const user = await requirePermission("events:read");
  const events = await EventModel.find(weddingScope(user)).select("_id name").sort({ startAt: 1, _id: 1 }).lean();
  return events.map(event => ({ id: event._id.toString(), name: event.name }));
}
export async function listTasks(search = new URLSearchParams()) {
  const user = await requirePermission("tasks:read");
  const { page, limit: pageLimit, skip } = pagination(search);
  const now = new Date();
  const scope = weddingScope(user);
  const filter: mongoose.QueryFilter<TaskRecord> = { ...scope };
  const status = search.get("status"), priority = search.get("priority"), eventId = search.get("eventId"), overdue = search.get("overdue");
  if (status) filter.status = taskStatus(status);
  if (priority) {
    if (!TASK_PRIORITIES.includes(priority as TaskPriority)) validationError("Choose a valid priority filter.");
    filter.priority = priority as TaskPriority;
  }
  if (eventId) filter.eventId = eventId === "wedding-wide" ? { $exists: false } : requireObjectId(eventId, "eventId");
  if (overdue && overdue !== "true" && overdue !== "false") validationError("Overdue must be true or false.");
  const from = taskDeadline(search.get("dueFrom")), to = taskDeadline(search.get("dueTo"));
  if (from && to && from > to) validationError("The deadline range must end on or after it starts.");
  if (from || to) filter.dueAt = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}) };
  if (search.has("assignedTo")) validationError("Individual task assignment filters are not available yet.");
  if (overdue === "true") { filter.dueAt = { ...(from ? { $gte: new Date(from) } : {}), ...(to ? { $lte: new Date(to) } : {}), $lt: now }; if (!status) filter.status = { $ne: "COMPLETED" }; }
  // Completed tasks are never overdue, even when both filters are supplied.
  if (overdue === "true" && status === "COMPLETED") filter._id = { $in: [] };
  const q = search.get("search")?.trim();
  if (q && q.length > 120) validationError("Search must be at most 120 characters.");
  if (q) filter.title = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const [tasks, total, todo, inProgress, completed, overdueCount] = await Promise.all([
    TaskModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(pageLimit).lean(),
    TaskModel.countDocuments(filter), TaskModel.countDocuments({ ...scope, status: "TODO" }),
    TaskModel.countDocuments({ ...scope, status: "IN_PROGRESS" }), TaskModel.countDocuments({ ...scope, status: "COMPLETED" }),
    TaskModel.countDocuments({ ...scope, dueAt: { $lt: now }, status: { $ne: "COMPLETED" } }),
  ]);
  return { tasks: tasks.map(serialize), pagination: { page, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) },
    counts: { total: todo + inProgress + completed, TODO: todo, IN_PROGRESS: inProgress, COMPLETED: completed, overdue: overdueCount }, asOf: now.getTime() };
}
export async function getTask(id: string) {
  const user = await requirePermission("tasks:read");
  const task = await TaskModel.findOne({ ...weddingScope(user), _id: requireObjectId(id, "taskId") }).lean();
  if (!task) throw missing();
  return serialize(task);
}
async function lockEvent(eventId: string | undefined, user: CurrentUser, session: mongoose.ClientSession) {
  if (!eventId) return;
  const filter = { ...weddingScope(user), _id: eventId };
  const event = await EventModel.findOne(filter).session(session).select("updatedAt").lean();
  if (!event) validationError("Choose an existing event from your wedding workspace.");
  // A real write serializes task linking against transactional event deletion.
  // Whichever commits first, deletion either clears the link or linking fails.
  await EventModel.updateOne(filter, { $set: { updatedAt: new Date(Math.max(Date.now(), event.updatedAt.getTime() + 1)) } }, { session, timestamps: false });
}
export async function createTask(input: unknown) {
  const user = await mutationUser(); const data = parseTaskInput(input);
  return mongoose.connection.transaction(async session => {
    await lockEvent(data.eventId, user, session);
    const [task] = await TaskModel.create([{ ...data, ...weddingScope(user), createdBy: user.id }], { session });
    if (task.status === "COMPLETED") await recordSystemActivity(user, session, { title: `Task completed: ${task.title}`, description: `${user.name} completed “${task.title}”.`, activityType: "Tasks", relatedEventId: task.eventId?.toString() });
    return serialize(task.toObject());
  });
}
export async function updateTask(id: string, input: unknown) {
  const user = await mutationUser(); const taskId = requireObjectId(id, "taskId"); const patch = taskPatch(input);
  return mongoose.connection.transaction(async session => {
    const task = await TaskModel.findOne({ ...weddingScope(user), _id: taskId }).session(session);
    if (!task) throw missing();
    const existing = serialize(task.toObject());
    const data = parseTaskInput({ title: existing.title, description: existing.description, eventId: existing.eventId,
      dueAt: existing.dueAt, priority: existing.priority, status: existing.status, ...patch });
    await lockEvent(data.eventId, user, session);
    const completed = task.status !== "COMPLETED" && data.status === "COMPLETED";
    task.set(data); await task.save({ session });
    if (completed) await recordSystemActivity(user, session, { title: `Task completed: ${task.title}`, description: `${user.name} completed “${task.title}”.`, activityType: "Tasks", relatedEventId: task.eventId?.toString() });
    return serialize(task.toObject());
  });
}
export async function updateTaskStatus(id: string, input: unknown) {
  const user = await requirePermission("tasks:read"); await limit(user);
  const taskId = requireObjectId(id, "taskId");
  if (!isRecord(input) || Object.keys(input).some(key => key !== "status")) validationError("Only task status can be changed here.");
  const status = taskStatus(input.status);
  return mongoose.connection.transaction(async session => {
    const task = await TaskModel.findOne({ ...weddingScope(user), _id: taskId }).session(session);
    if (!task) throw missing();
    if (!canUpdateTaskStatus(user, serialize(task.toObject()))) throw new AppError("FORBIDDEN", "You cannot update this task's status.", 403);
    const completed = task.status !== "COMPLETED" && status === "COMPLETED";
    if (completed) await lockEvent(task.eventId?.toString(), user, session);
    task.status = status; await task.save({ session });
    if (completed) await recordSystemActivity(user, session, { title: `Task completed: ${task.title}`, description: `${user.name} completed “${task.title}”.`, activityType: "Tasks", relatedEventId: task.eventId?.toString() });
    return serialize(task.toObject());
  });
}
export async function deleteTask(id: string) {
  const user = await mutationUser();
  const result = await TaskModel.deleteOne({ ...weddingScope(user), _id: requireObjectId(id, "taskId") });
  if (!result.deletedCount) throw missing();
}
