import "server-only";
import mongoose from "mongoose";
import { requirePermission, weddingScope } from "@/features/auth/authorization";
import { AppError } from "@/lib/api/errors";
import { pagination, requireObjectId, validationError } from "@/lib/api/validation";
import { EventModel, type EventRecord } from "@/models/event";
import { TaskModel } from "@/models/task";
import { ExpenseModel } from "@/models/expense";
import { PhotoModel } from "@/models/photo";
import { ActivityModel } from "@/models/activity";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";
import { eventPatch, parseEventInput } from "./requests";
import type { WeddingEvent } from "./types";

function serialize(event: EventRecord & { _id: mongoose.Types.ObjectId }): WeddingEvent {
  return { id: event._id.toString(), weddingId: event.weddingId.toString(),
    name: event.name, venue: event.venue, startAt: event.startAt.toISOString(), endAt: event.endAt?.toISOString(),
    description: event.description ?? undefined, location: event.location ?? undefined, livestreamUrl: event.livestreamUrl ?? undefined, status: event.status ?? undefined,
    createdBy: event.createdBy.toString(), createdAt: event.createdAt.toISOString(), updatedAt: event.updatedAt.toISOString() };
}
const missing = () => new AppError("NOT_FOUND", "This event could not be found in your wedding workspace.", 404);

async function mutationUser() {
  const user = await requirePermission("events:manage");
  await enforceRateLimit({ scope: "events", key: `user:${user.id}`, limit: 60, windowSeconds: 60 });
  return user;
}

export async function listEvents(search = new URLSearchParams()) {
  const user = await requirePermission("events:read");
  const { page, limit, skip } = pagination(search);
  const view = search.get("view");
  if (view !== null && view !== "upcoming" && view !== "past") validationError("Event view must be upcoming or past.");
  const scope = weddingScope(user);
  const now = new Date();
  // An event remains upcoming while it is in progress; events without an end use their start.
  const upcoming = { $or: [{ endAt: { $gte: now } }, { endAt: null, startAt: { $gte: now } }] };
  const past = { $or: [{ endAt: { $lt: now } }, { endAt: null, startAt: { $lt: now } }] };
  const filter = { ...scope, ...(view === "upcoming" ? upcoming : view === "past" ? past : {}) };
  const [records, total, upcomingCount, pastCount] = await Promise.all([
    EventModel.find(filter).sort({ startAt: 1, _id: 1 }).skip(skip).limit(limit).lean(),
    EventModel.countDocuments(filter), EventModel.countDocuments({ ...scope, ...upcoming }), EventModel.countDocuments({ ...scope, ...past }),
  ]);
  return { events: records.map(serialize), pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    counts: { upcoming: upcomingCount, past: pastCount }, asOf: now.getTime() };
}

export async function getEvent(id: string): Promise<WeddingEvent> {
  const user = await requirePermission("events:read");
  const event = await EventModel.findOne({ ...weddingScope(user), _id: requireObjectId(id, "eventId") }).lean();
  if (!event) throw missing();
  return serialize(event);
}

export async function createEvent(input: unknown): Promise<WeddingEvent> {
  const user = await mutationUser();
  const data = parseEventInput(input);
  const event = await EventModel.create({ ...data, ...weddingScope(user), createdBy: user.id });
  return serialize(event.toObject());
}

export async function updateEvent(id: string, input: unknown): Promise<WeddingEvent> {
  const user = await mutationUser();
  const scope = { ...weddingScope(user), _id: requireObjectId(id, "eventId") };
  // Reading, validating the resulting date order, and writing belong to one transaction.
  return mongoose.connection.transaction(async session => {
    const event = await EventModel.findOne(scope).session(session);
    if (!event) throw missing();
    const data = parseEventInput({ ...serialize(event.toObject()), ...eventPatch(input) });
    event.set(data);
    await event.save({ session });
    return serialize(event.toObject());
  });
}

export async function deleteEvent(id: string): Promise<void> {
  const user = await mutationUser();
  const eventId = requireObjectId(id, "eventId");
  const scope = weddingScope(user);
  await mongoose.connection.transaction(async session => {
    const removed = await EventModel.deleteOne({ ...scope, _id: eventId }, { session });
    if (!removed.deletedCount) throw missing();
    // Keep operations sequential: MongoDB transactions do not support parallel writes.
    await TaskModel.updateMany({ ...scope, eventId }, { $unset: { eventId: "" } }, { session });
    await ExpenseModel.updateMany({ ...scope, eventId }, { $unset: { eventId: "" } }, { session });
    await PhotoModel.updateMany({ ...scope, eventId }, { $unset: { eventId: "" } }, { session });
    await ActivityModel.updateMany({ ...scope, relatedEventId: eventId }, { $unset: { relatedEventId: "" } }, { session });
  });
}
