import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { registerOwner } from "@/features/auth/service";
import { ensureAuthIndexes } from "@/features/auth/indexes";
import { dashboardEvents, dashboardTasks } from "@/features/dashboard/service";
import { GET } from "@/app/api/v1/dashboard/route";
import { createTask, updateTaskStatus } from "@/features/tasks/service";
import { createEvent } from "@/features/events/service";
import { TaskModel } from "@/models/task";
import { UserModel } from "@/models/user";
import { EventModel } from "@/models/event";

const context = vi.hoisted(() => ({ cookie: null as string | null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(context.cookie ? { cookie: context.cookie } : {}) }));
let mongo: MongoMemoryReplSet, owner: Awaited<ReturnType<typeof registerOwner>>;
const registration = { name: "Sai", email: "dashboard@example.com", password: "12345678", relationshipType: "GROOM",
  wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } };
const request = (query = "") => new Request(`http://localhost:3000/api/v1/dashboard${query}`);
beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  vi.stubEnv("MONGODB_URI", mongo.getUri("mmm-test-dashboard")); vi.stubEnv("MONGODB_DB_NAME", "mmm-test-dashboard");
  vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "test-only-".repeat(8)); vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"); vi.stubEnv("NODE_ENV", "development");
  await ensureAuthIndexes();
});
beforeEach(async () => {
  vi.restoreAllMocks(); context.cookie = null;
  if (mongoose.connection.name !== "mmm-test-dashboard") throw new Error("Unexpected integration database.");
  for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({});
  owner = await registerOwner(registration, null); context.cookie = `mmm_session=${owner.session.token}`;
});
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); vi.unstubAllEnvs(); });

test("global summary includes every task while attention is bounded, ordered and excludes completed/no-deadline tasks", async () => {
  const now = Date.now(), hour = 3_600_000;
  const event = await createEvent({ name: "Haldi", venue: "Home", startAt: new Date(now + hour).toISOString() });
  const earliest = await createTask({ title: "Overdue", dueAt: new Date(now - hour).toISOString(), eventId: event.id });
  await createTask({ title: "Due soon", dueAt: new Date(now + hour).toISOString(), status: "IN_PROGRESS" });
  await createTask({ title: "Last preview", dueAt: new Date(now + hour * 2).toISOString() });
  await createTask({ title: "Outside preview", dueAt: new Date(now + hour * 3).toISOString() });
  await createTask({ title: "Later", dueAt: new Date(now + hour * 24 * 8).toISOString() });
  await createTask({ title: "No deadline" });
  for (let i = 0; i < 21; i++) await createTask({ title: `Done ${i}`, status: "COMPLETED", dueAt: new Date(now - hour).toISOString() });
  const result = await dashboardTasks();
  expect(result.counts).toEqual({ total: 27, completed: 21, unfinished: 6, overdue: 1 });
  expect(result.attentionTotal).toBe(4); expect(result.attention.map(task => task.title)).toEqual(["Overdue", "Due soon", "Last preview"]);
  expect(result.attention[0]).toMatchObject({ id: earliest.id, canComplete: true, event: { id: event.id, name: "Haldi" } });
  expect(result.attention[0]).not.toHaveProperty("weddingId"); expect(result.attention[0]).not.toHaveProperty("assignedTo");
  await updateTaskStatus(earliest.id, { status: "COMPLETED" });
  expect((await dashboardTasks()).counts).toEqual({ total: 27, completed: 22, unfinished: 5, overdue: 0 });
});

test("summary and linked event names cannot cross weddings; family completion follows central permissions", async () => {
  const task = await createTask({ title: "Private task", dueAt: "2020-01-01T00:00:00Z" });
  const other = await registerOwner({ ...registration, email: "other-dashboard@example.com" }, null);
  context.cookie = `mmm_session=${other.session.token}`;
  const otherEvent = await createEvent({ name: "Secret other ceremony", venue: "Private", startAt: "2099-01-01T00:00:00Z" });
  expect((await dashboardTasks()).counts.total).toBe(0);
  context.cookie = `mmm_session=${owner.session.token}`;
  // Deliberately malformed imported reference must never leak another wedding's name.
  await TaskModel.updateOne({ _id: task.id }, { eventId: otherEvent.id });
  expect((await dashboardTasks()).attention[0].event).toBeUndefined();
  await UserModel.updateOne({ _id: owner.user.id }, { role: "FAMILY_MEMBER" });
  expect((await dashboardTasks()).attention[0].canComplete).toBe(false);
  await TaskModel.updateOne({ _id: task.id }, { assignedTo: owner.user.id });
  expect((await dashboardTasks()).attention[0].canComplete).toBe(true);
  const response = await GET(request(`?section=tasks&weddingId=${other.user.weddingId}`));
  expect((await response.json()).data.counts.total).toBe(1);
  expect((await dashboardEvents()).events).toHaveLength(0);
});

test("upcoming timeline keeps ongoing events, excludes past ones, sorts and bounds the preview", async () => {
  const now = Date.now(), hour = 3_600_000;
  await createEvent({ name: "Past", venue: "Home", startAt: new Date(now - 2 * hour).toISOString() });
  await createEvent({ name: "Ongoing", venue: "Hall", startAt: new Date(now - hour).toISOString(), endAt: new Date(now + hour).toISOString() });
  for (let i = 6; i >= 1; i--) await createEvent({ name: `Upcoming ${i}`, venue: "Courtyard", startAt: new Date(now + i * hour).toISOString() });
  const result = await dashboardEvents();
  expect(result).toMatchObject({ total: 8, upcoming: 7 });
  expect(result.events.map(event => event.name)).toEqual(["Ongoing", "Upcoming 1", "Upcoming 2", "Upcoming 3", "Upcoming 4"]);
  expect(result.events[0]).not.toHaveProperty("createdBy");
});

test("dashboard API requires a session and allows successful empty sections; invalid selector is rejected", async () => {
  const response = await GET(request()); expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
  const result = await response.json();
  expect(result.data.tasks).toMatchObject({ status: "ready", data: { counts: { total: 0 }, attention: [] } });
  expect(result.data.events).toMatchObject({ status: "ready", data: { total: 0, events: [] } });
  expect((await GET(request("?section=wrong"))).status).toBe(400);
  context.cookie = null; expect((await GET(request())).status).toBe(401);
});

test("one section failure preserves the other and never returns fabricated zero counts or driver details", async () => {
  await createEvent({ name: "Saved ceremony", venue: "Hall", startAt: "2099-01-01T00:00:00Z" });
  vi.spyOn(console, "error").mockImplementation(() => {});
  const failure = vi.spyOn(TaskModel, "aggregate").mockRejectedValue(new Error("private database credentials"));
  const response = await GET(request()), result = await response.json();
  expect(result.data.tasks).toEqual({ status: "error", data: null });
  expect(result.data.events).toMatchObject({ status: "ready", data: { upcoming: 1 } });
  expect(JSON.stringify(result)).not.toContain("credentials");
  expect((await GET(request("?section=tasks"))).status).toBe(500);
  failure.mockRestore();
  expect((await GET(request("?section=tasks"))).status).toBe(200);
  vi.spyOn(EventModel, "find").mockImplementation(() => { throw new Error("unavailable"); });
  const second = await (await GET(request())).json();
  expect(second.data.tasks.status).toBe("ready"); expect(second.data.events).toEqual({ status: "error", data: null });
});
