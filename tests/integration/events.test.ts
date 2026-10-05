import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { registerOwner } from "@/features/auth/service";
import { ensureAuthIndexes } from "@/features/auth/indexes";
import { createEvent, deleteEvent, getEvent, listEvents, updateEvent } from "@/features/events/service";
import { UserModel } from "@/models/user";
import { EventModel } from "@/models/event";
import { TaskModel } from "@/models/task";
import { ExpenseModel } from "@/models/expense";
import { PhotoModel } from "@/models/photo";
import { ActivityModel } from "@/models/activity";
import { POST, GET } from "@/app/api/v1/events/route";
import { PUT, DELETE } from "@/app/api/v1/events/[eventId]/route";

const context = vi.hoisted(() => ({ cookie: null as string | null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(context.cookie ? { cookie: context.cookie } : {}) }));
let mongo: MongoMemoryReplSet;
let owner: Awaited<ReturnType<typeof registerOwner>>;
const registration = { name: "Sai", email: "sai@example.com", password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } };
const details = { name: "Sangeet", venue: "Family hall", startAt: "2027-02-28T20:00:00+05:30", endAt: "2027-03-01T01:00:00+05:30", description: "Together" };
const request = (method: string, body?: unknown, origin = "http://localhost:3000") => new Request("http://localhost:3000/api/v1/events", { method, headers: { origin, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
const routeContext = (eventId: string) => ({ params: Promise.resolve({ eventId }) });

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  vi.stubEnv("MONGODB_URI", mongo.getUri("mmm-test-events")); vi.stubEnv("MONGODB_DB_NAME", "mmm-test-events");
  vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "test-only-".repeat(8)); vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"); vi.stubEnv("NODE_ENV", "development");
  await ensureAuthIndexes();
});
beforeEach(async () => {
  vi.restoreAllMocks(); context.cookie = null;
  if (mongoose.connection.name !== "mmm-test-events") throw new Error("Unexpected integration database.");
  for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({});
  owner = await registerOwner(registration, null); context.cookie = `mmm_session=${owner.session.token}`;
});
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); vi.unstubAllEnvs(); });

test("CRUD persists only approved fields and partial updates validate resulting date order", async () => {
  const created = await createEvent({ ...details, weddingId: new mongoose.Types.ObjectId().toString(), createdBy: "forged" });
  expect(created).toMatchObject({ weddingId: owner.user.weddingId, createdBy: owner.user.id, name: "Sangeet", startAt: "2027-02-28T14:30:00.000Z" });
  expect(await getEvent(created.id)).toEqual(created);
  await expect(updateEvent(created.id, { startAt: "2027-03-02T00:00:00Z" })).rejects.toMatchObject({ status: 400 });
  expect((await getEvent(created.id)).startAt).toBe(created.startAt);
  const edited = await updateEvent(created.id, { name: "Reception", endAt: null, description: "", createdBy: "forged", weddingId: "forged" });
  expect(edited).toMatchObject({ name: "Reception", weddingId: owner.user.weddingId, createdBy: owner.user.id });
  expect(edited.endAt).toBeUndefined(); expect(edited.description).toBeUndefined();
  await deleteEvent(created.id); await expect(getEvent(created.id)).rejects.toMatchObject({ status: 404 });
});
test("list is scoped, chronological, paginated and separates ended events from ongoing ones", async () => {
  const now = Date.now();
  await createEvent({ ...details, name: "Future", startAt: new Date(now + 7200000).toISOString(), endAt: null });
  await createEvent({ ...details, name: "Ongoing", startAt: new Date(now - 7200000).toISOString(), endAt: new Date(now + 7200000).toISOString() });
  await createEvent({ ...details, name: "Past", startAt: new Date(now - 14400000).toISOString(), endAt: new Date(now - 7200000).toISOString() });
  const list = await listEvents(new URLSearchParams("view=upcoming&limit=1&page=1"));
  expect(list.events.map(event => event.name)).toEqual(["Ongoing"]); expect(list.pagination).toMatchObject({ total: 2, pages: 2 });
  expect(list.counts).toEqual({ upcoming: 2, past: 1 });
  expect((await listEvents(new URLSearchParams("view=upcoming&limit=1&page=2"))).events[0].name).toBe("Future");
  expect((await listEvents(new URLSearchParams("view=past"))).events[0].name).toBe("Past");
  await expect(listEvents(new URLSearchParams("view=invalid"))).rejects.toMatchObject({ status: 400 });
  await expect(listEvents(new URLSearchParams("limit=101"))).rejects.toMatchObject({ status: 400 });
});
test("other weddings cannot read, edit or delete an event through a forged ID", async () => {
  const event = await createEvent(details);
  const second = await registerOwner({ ...registration, email: "second@example.com" }, null);
  context.cookie = `mmm_session=${second.session.token}`;
  expect((await listEvents()).events).toHaveLength(0);
  await expect(getEvent(event.id)).rejects.toMatchObject({ status: 404 });
  await expect(updateEvent(event.id, { name: "Forged" })).rejects.toMatchObject({ status: 404 });
  await expect(deleteEvent(event.id)).rejects.toMatchObject({ status: 404 });
  expect(await EventModel.countDocuments()).toBe(1);
});
test("FAMILY_MEMBER can read only; ADMIN can manage; unauthenticated API returns 401", async () => {
  const event = await createEvent(details);
  await UserModel.updateOne({ _id: owner.user.id }, { role: "FAMILY_MEMBER" });
  expect((await getEvent(event.id)).name).toBe("Sangeet");
  for (const action of [() => createEvent(details), () => updateEvent(event.id, { name: "Denied" }), () => deleteEvent(event.id)]) {
    await expect(action()).rejects.toMatchObject({ status: 403 });
  }
  await UserModel.updateOne({ _id: owner.user.id }, { role: "ADMIN" }); expect((await updateEvent(event.id, { name: "Admin edit" })).name).toBe("Admin edit");
  context.cookie = null; expect((await GET(request("GET"))).status).toBe(401);
});

async function linkedRecords(eventId: string, weddingId = owner.user.weddingId) {
  const common = { weddingId, eventId, createdBy: owner.user.id };
  const task = await TaskModel.create({ ...common, title: "Book venue", priority: "HIGH", status: "TODO" });
  const expense = await ExpenseModel.create({ ...common, name: "Venue", category: "Venue", amount: 2000, paymentStatus: "UNPAID" });
  const photo = await PhotoModel.create({ weddingId, eventId, s3Key: "test/retained.jpg", fileName: "retained.jpg", fileSize: 100, mimeType: "image/jpeg" });
  const activity = await ActivityModel.create({ weddingId, relatedEventId: eventId, createdBy: owner.user.id, title: "Venue booked", sourceType: "SYSTEM" });
  return { task, expense, photo, activity };
}
test("deleting an event keeps all four linked record types, clears links and leaves other wedding data untouched", async () => {
  const event = await createEvent(details); const linked = await linkedRecords(event.id);
  const otherWeddingId = new mongoose.Types.ObjectId().toString(); const foreign = await linkedRecords(event.id, otherWeddingId);
  await deleteEvent(event.id);
  expect((await TaskModel.findById(linked.task._id))?.eventId).toBeUndefined();
  expect((await ExpenseModel.findById(linked.expense._id))?.eventId).toBeUndefined();
  expect((await PhotoModel.findById(linked.photo._id))?.eventId).toBeUndefined();
  expect((await ActivityModel.findById(linked.activity._id))?.relatedEventId).toBeUndefined();
  expect((await PhotoModel.findById(linked.photo._id))?.s3Key).toBe("test/retained.jpg");
  expect((await TaskModel.findById(foreign.task._id))?.eventId?.toString()).toBe(event.id);
  expect((await ExpenseModel.findById(foreign.expense._id))?.eventId?.toString()).toBe(event.id);
  expect((await PhotoModel.findById(foreign.photo._id))?.eventId?.toString()).toBe(event.id);
  expect((await ActivityModel.findById(foreign.activity._id))?.relatedEventId?.toString()).toBe(event.id);
  expect(await TaskModel.countDocuments()).toBe(2); expect(await ExpenseModel.countDocuments()).toBe(2); expect(await PhotoModel.countDocuments()).toBe(2); expect(await ActivityModel.countDocuments()).toBe(2);
});
test("a failed unlink rolls back event removal and earlier reference changes", async () => {
  const event = await createEvent(details); const linked = await linkedRecords(event.id);
  vi.spyOn(PhotoModel, "updateMany").mockImplementationOnce(() => { throw new Error("Injected unlink failure"); });
  await expect(deleteEvent(event.id)).rejects.toThrow("Injected unlink failure");
  expect(await EventModel.countDocuments()).toBe(1);
  expect((await TaskModel.findById(linked.task._id))?.eventId?.toString()).toBe(event.id);
  expect((await ExpenseModel.findById(linked.expense._id))?.eventId?.toString()).toBe(event.id);
});
test("HTTP mutations validate origin, payload and IDs, return correct statuses, and enforce durable limits", async () => {
  expect((await POST(request("POST", details, "https://evil.example"))).status).toBe(403);
  expect((await POST(request("POST", { ...details, startAt: "bad" }))).status).toBe(400);
  const response = await POST(request("POST", details)); expect(response.status).toBe(201);
  const { data } = await response.json();
  expect((await PUT(request("PUT", { name: "Updated" }), routeContext(data.id))).status).toBe(200);
  expect((await DELETE(request("DELETE"), routeContext("bad-id"))).status).toBe(400);
  expect((await DELETE(request("DELETE"), routeContext(data.id))).status).toBe(204);
  expect((await POST(request("POST", { ...details, description: "శ".repeat(5000), location: "శ".repeat(1000) }))).status).toBe(201);
  expect((await POST(request("POST", { ...details, description: "x".repeat(33000) }))).status).toBe(413);
  await mongoose.connection.collection("rate_limits").deleteMany({});
  // Keep all attempts in one counter window, including slow CI runs near a minute boundary.
  vi.spyOn(Date, "now").mockReturnValue(Date.now());
  for (let index = 0; index < 60; index++) await createEvent(details);
  const limited = await POST(request("POST", details)); expect(limited.status).toBe(429); expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
});
