import "server-only";
import mongoose from "mongoose";
import { requirePermission, weddingScope } from "@/features/auth/authorization";
import { canModifyActivity } from "@/features/auth/permissions";
import { AppError } from "@/lib/api/errors";
import { pagination, requireObjectId, validationError } from "@/lib/api/validation";
import { ActivityModel, type ActivityRecord } from "@/models/activity";
import { EventModel } from "@/models/event";
import { UserModel } from "@/models/user";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";
import { ACTIVITY_SOURCES, type ActivitySource, type CurrentUser } from "@/types/domain";
import { ensureActivityIndexes } from "./record";
import { activityPatch, parseActivityInput } from "./requests";
import type { ActivityList, WeddingActivity } from "./types";

type RecordWithId = ActivityRecord & { _id: mongoose.Types.ObjectId };
const missing = () => new AppError("NOT_FOUND", "This update could not be found in your wedding workspace.", 404);
async function activityUser(permission: "activities:read" | "activities:create") {
  const user = await requirePermission(permission);
  await ensureActivityIndexes();
  return user;
}
async function limit(user: CurrentUser) {
  await enforceRateLimit({ scope: "activities", key: `user:${user.id}`, limit: 60, windowSeconds: 60 });
}
export async function activityEventOptions() {
  const user = await activityUser("activities:read");
  const events = await EventModel.find(weddingScope(user)).select("_id name").sort({ startAt: 1, _id: 1 }).lean();
  return events.map(event => ({ id: event._id.toString(), name: event.name }));
}
async function serialize(records: RecordWithId[], user: CurrentUser): Promise<WeddingActivity[]> {
  const [authors, events] = await Promise.all([
    UserModel.find({ ...weddingScope(user), _id: { $in: records.map(record => record.createdBy) } }).select("_id name").lean(),
    EventModel.find({ ...weddingScope(user), _id: { $in: records.flatMap(record => record.relatedEventId ? [record.relatedEventId] : []) } }).select("_id name").lean(),
  ]);
  const names = new Map(authors.map(author => [author._id.toString(), author.name]));
  const eventNames = new Map(events.map(event => [event._id.toString(), event.name]));
  return records.map(record => {
    const createdBy = record.createdBy.toString(), eventId = record.relatedEventId?.toString();
    // Missing/foreign references cannot expose another wedding's member or event.
    const event = eventId && eventNames.has(eventId) ? { id: eventId, name: eventNames.get(eventId)! } : undefined;
    return { id: record._id.toString(), title: record.title, description: record.description ?? undefined,
      activityType: record.activityType ?? undefined, sourceType: record.sourceType, createdBy,
      authorName: names.get(createdBy) ?? "Former member", createdAt: record.createdAt.toISOString(),
      relatedEventId: event?.id, event,
      canModify: canModifyActivity(user, { weddingId: record.weddingId.toString(), createdBy, sourceType: record.sourceType }),
    };
  });
}
export async function listActivities(search = new URLSearchParams()): Promise<ActivityList> {
  const user = await activityUser("activities:read"), { page, limit: pageLimit, skip } = pagination(search);
  const filter: mongoose.QueryFilter<ActivityRecord> = { ...weddingScope(user) };
  const source = search.get("sourceType"), event = search.get("relatedEventId"), q = search.get("search")?.trim();
  if (source) {
    if (!ACTIVITY_SOURCES.includes(source as ActivitySource)) validationError("Choose a valid update source.");
    filter.sourceType = source as ActivitySource;
  }
  if (event) filter.relatedEventId = event === "wedding-wide" ? { $in: [null] } : requireObjectId(event, "relatedEventId");
  if (q) {
    if (q.length > 120) validationError("Search must be at most 120 characters.");
    const literal = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = [{ title: literal }, { description: literal }];
  }
  const [records, total, events] = await Promise.all([
    ActivityModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(pageLimit).lean(),
    ActivityModel.countDocuments(filter), activityEventOptions(),
  ]);
  return { activities: await serialize(records, user), events, pagination: { page, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) }, asOf: Date.now() };
}
export async function getActivity(id: string): Promise<WeddingActivity> {
  const user = await activityUser("activities:read");
  const record = await ActivityModel.findOne({ ...weddingScope(user), _id: requireObjectId(id, "activityId") }).lean();
  if (!record) throw missing();
  return (await serialize([record], user))[0];
}
async function lockEvent(eventId: string | undefined, user: CurrentUser, session: mongoose.ClientSession) {
  if (!eventId) return;
  const filter = { ...weddingScope(user), _id: eventId };
  const event = await EventModel.findOne(filter).select("updatedAt").session(session).lean();
  if (!event) validationError("Choose an existing event from your wedding workspace.");
  await EventModel.updateOne(filter, { $set: { updatedAt: new Date(Math.max(Date.now(), event.updatedAt.getTime() + 1)) } }, { session, timestamps: false });
}
function assertModify(user: CurrentUser, record: RecordWithId) {
  if (!canModifyActivity(user, { weddingId: record.weddingId.toString(), createdBy: record.createdBy.toString(), sourceType: record.sourceType })) {
    throw new AppError("FORBIDDEN", record.sourceType === "SYSTEM" ? "Automatic updates cannot be edited or deleted." : "You can only change your own manual updates.", 403);
  }
}
export async function createActivity(input: unknown) {
  const user = await activityUser("activities:create"); await limit(user);
  const data = parseActivityInput(input);
  const id = await mongoose.connection.transaction(async session => {
    await lockEvent(data.relatedEventId, user, session);
    const [record] = await ActivityModel.create([{ ...data, ...weddingScope(user), createdBy: user.id, sourceType: "MANUAL" }], { session });
    return record._id.toString();
  });
  return getActivity(id);
}
export async function updateActivity(id: string, input: unknown) {
  const user = await activityUser("activities:read"); await limit(user);
  const activityId = requireObjectId(id, "activityId"), patch = activityPatch(input);
  await mongoose.connection.transaction(async session => {
    const record = await ActivityModel.findOne({ ...weddingScope(user), _id: activityId }).session(session);
    if (!record) throw missing();
    assertModify(user, record.toObject());
    const data = parseActivityInput({ title: record.title, description: record.description, activityType: record.activityType, relatedEventId: record.relatedEventId?.toString(), ...patch });
    await lockEvent(data.relatedEventId, user, session);
    record.set(data); await record.save({ session });
  });
  return getActivity(id);
}
export async function deleteActivity(id: string) {
  const user = await activityUser("activities:read"); await limit(user);
  const activityId = requireObjectId(id, "activityId");
  await mongoose.connection.transaction(async session => {
    const record = await ActivityModel.findOne({ ...weddingScope(user), _id: activityId }).session(session);
    if (!record) throw missing();
    assertModify(user, record.toObject());
    await record.deleteOne({ session });
  });
}
export async function recentActivities() {
  const user = await activityUser("activities:read");
  const records = await ActivityModel.find(weddingScope(user)).sort({ createdAt: -1, _id: -1 }).limit(3).lean();
  return { activities: await serialize(records, user), asOf: Date.now() };
}
