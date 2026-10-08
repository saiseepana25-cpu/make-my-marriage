import "server-only";
import mongoose from "mongoose";
import { requirePermission, weddingScope } from "@/features/auth/authorization";
import { AppError } from "@/lib/api/errors";
import { pagination, requireObjectId, validationError } from "@/lib/api/validation";
import { GuestModel, type GuestRecord } from "@/models/guest";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";
import { ensureActivityIndexes, recordSystemActivity } from "@/features/activities/record";
import { attendanceLabels } from "./format";
import { RSVP_STATUSES, type CurrentUser, type RsvpStatus } from "@/types/domain";
import { guestPatch, parseGuestInput } from "./requests";
import type { GuestList, GuestSummary, WeddingGuest } from "./types";

function serialize(guest: GuestRecord & { _id: mongoose.Types.ObjectId }): WeddingGuest {
  return { id: guest._id.toString(), name: guest.name, phone: guest.phone ?? undefined, email: guest.email ?? undefined,
    familyName: guest.familyName ?? undefined, numberInvited: guest.numberInvited ?? undefined, numberAttending: guest.numberAttending ?? undefined,
    rsvpStatus: guest.rsvpStatus, notes: guest.notes ?? undefined, rsvpUpdatedAt: guest.rsvpUpdatedAt?.toISOString(),
    createdAt: guest.createdAt.toISOString(), updatedAt: guest.updatedAt.toISOString() };
}
const missing = () => new AppError("NOT_FOUND", "This guest could not be found in your wedding workspace.", 404);
let indexes: Promise<void> | undefined;
async function guestUser(permission: "guests:read" | "guests:manage") {
  const user = await requirePermission(permission);
  indexes ??= GuestModel.createIndexes().then(() => undefined).catch(error => { indexes = undefined; throw error; });
  await indexes;
  return user;
}
async function limit(user: CurrentUser) { await enforceRateLimit({ scope: "guests", key: `user:${user.id}`, limit: 60, windowSeconds: 60 }); await ensureActivityIndexes(); }
export async function guestFamilies(): Promise<string[]> {
  const user = await guestUser("guests:read");
  const families = await GuestModel.distinct("familyName", weddingScope(user));
  return families.filter((value): value is string => typeof value === "string" && !!value.trim()).sort((a, b) => a.localeCompare(b));
}
export async function listGuests(search = new URLSearchParams()): Promise<GuestList> {
  const user = await guestUser("guests:read"), { page, limit: pageLimit, skip } = pagination(search);
  const filter: mongoose.QueryFilter<GuestRecord> = { ...weddingScope(user) };
  const status = search.get("rsvpStatus"), family = search.get("familyName"), noFamily = search.get("withoutFamily"), q = search.get("search")?.trim();
  if (status) {
    if (!RSVP_STATUSES.includes(status as RsvpStatus)) validationError("Choose a valid attendance status.");
    filter.rsvpStatus = status as RsvpStatus;
  }
  if (noFamily !== null && noFamily !== "true") validationError("Choose a valid family filter.");
  if (family && noFamily) validationError("Choose a family name or No family name, not both.");
  if (family) { if (family.length > 120) validationError("Family name must be at most 120 characters."); filter.familyName = family; }
  if (noFamily) filter.familyName = { $in: [null, ""] };
  if (q) {
    if (q.length > 120) validationError("Search must be at most 120 characters.");
    const literal = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    filter.$or = ["name", "familyName", "phone", "email"].map(key => ({ [key]: literal }));
  }
  const [guests, total, families] = await Promise.all([
    GuestModel.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(pageLimit).lean(), GuestModel.countDocuments(filter), guestFamilies(),
  ]);
  return { guests: guests.map(serialize), families, pagination: { page, limit: pageLimit, total, pages: Math.ceil(total / pageLimit) } };
}
export async function guestSummary(): Promise<GuestSummary> {
  const user = await guestUser("guests:read");
  const groups = await GuestModel.aggregate<{ _id: RsvpStatus; count: number }>([
    { $match: { weddingId: new mongoose.Types.ObjectId(user.weddingId) } }, { $group: { _id: "$rsvpStatus", count: { $sum: 1 } } },
  ]);
  const counts = new Map(groups.map(group => [group._id, group.count]));
  return { total: groups.reduce((sum, group) => sum + group.count, 0), pending: counts.get("PENDING") ?? 0,
    attending: counts.get("ATTENDING") ?? 0, notAttending: counts.get("NOT_ATTENDING") ?? 0 };
}
export async function getGuest(id: string) {
  const user = await guestUser("guests:read");
  const guest = await GuestModel.findOne({ ...weddingScope(user), _id: requireObjectId(id, "guestId") }).lean();
  if (!guest) throw missing(); return serialize(guest);
}
export async function createGuest(input: unknown) {
  const user = await guestUser("guests:manage"); await limit(user);
  const data = parseGuestInput(input);
  return mongoose.connection.transaction(async session => {
    const [guest] = await GuestModel.create([{ ...data, ...weddingScope(user), rsvpUpdatedAt: new Date() }], { session });
    await recordSystemActivity(user, session, { title: `Guest added: ${guest.name}`, description: `${user.name} added “${guest.name}” to the guest list. Attendance: ${attendanceLabels[guest.rsvpStatus]}.`, activityType: "Guests" });
    return serialize(guest.toObject());
  });
}
export async function updateGuest(id: string, input: unknown) {
  const user = await guestUser("guests:manage"); await limit(user);
  const guestId = requireObjectId(id, "guestId"), patch = guestPatch(input);
  // Transaction retries preserve unrelated concurrent edits and attendance timestamp decisions.
  return mongoose.connection.transaction(async session => {
    const guest = await GuestModel.findOne({ ...weddingScope(user), _id: guestId }).session(session);
    if (!guest) throw missing();
    const data = parseGuestInput({ ...serialize(guest.toObject()), ...patch });
    const attendanceChanged = guest.rsvpStatus !== data.rsvpStatus || (guest.numberAttending ?? undefined) !== data.numberAttending;
    if (attendanceChanged) guest.rsvpUpdatedAt = new Date();
    guest.set(data); await guest.save({ session });
    if (attendanceChanged) await recordSystemActivity(user, session, { title: `Guest attendance updated: ${guest.name}`, description: `${user.name} recorded ${attendanceLabels[guest.rsvpStatus].toLowerCase()} for “${guest.name}”. Number attending: ${guest.numberAttending ?? "not provided"}.`, activityType: "Guests" });
    return serialize(guest.toObject());
  });
}
export async function deleteGuest(id: string) {
  const user = await guestUser("guests:manage"); await limit(user);
  const result = await GuestModel.deleteOne({ ...weddingScope(user), _id: requireObjectId(id, "guestId") });
  if (!result.deletedCount) throw missing();
}
