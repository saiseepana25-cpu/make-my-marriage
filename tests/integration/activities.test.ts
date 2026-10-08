import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { registerOwner } from "@/features/auth/service";
import { ensureAuthIndexes } from "@/features/auth/indexes";
import { createActivity, updateActivity, deleteActivity, getActivity, listActivities, recentActivities } from "@/features/activities/service";
import { createEvent, deleteEvent } from "@/features/events/service";
import { createTask, updateTask, updateTaskStatus, getTask } from "@/features/tasks/service";
import { createExpense } from "@/features/expenses/service";
import { createGuest, updateGuest, getGuest } from "@/features/guests/service";
import { ActivityModel } from "@/models/activity";
import { EventModel } from "@/models/event";
import { GuestModel } from "@/models/guest";
import { ExpenseModel } from "@/models/expense";
import { TaskModel } from "@/models/task";
import { UserModel } from "@/models/user";
import { GET, POST } from "@/app/api/v1/activities/route";
import { PUT, DELETE } from "@/app/api/v1/activities/[activityId]/route";
import { GET as dashboard } from "@/app/api/v1/dashboard/route";
const context = vi.hoisted(() => ({ cookie: null as string | null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(context.cookie ? { cookie: context.cookie } : {}) }));
let mongo: MongoMemoryReplSet, owner: Awaited<ReturnType<typeof registerOwner>>;
const registration = { name: "Sai", email: "activity@example.com", password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } };
const eventInput = { name: "Haldi", venue: "Family Hall", startAt: "2027-02-28T10:00:00+05:30" };
const input = { title: "Outfits [QA]", description: "శుభం — family update", activityType: "Wardrobe" };
const routeContext = (activityId: string) => ({ params: Promise.resolve({ activityId }) });
const request = (method = "GET", body?: unknown, origin = "http://localhost:3000") => new Request("http://localhost:3000/api/v1/activities", { method, headers: { origin, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  vi.stubEnv("MONGODB_URI", mongo.getUri("mmm-test-activities")); vi.stubEnv("MONGODB_DB_NAME", "mmm-test-activities"); vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "test-only-".repeat(8)); vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"); vi.stubEnv("NODE_ENV", "development"); await ensureAuthIndexes();
});
beforeEach(async () => {
  vi.restoreAllMocks(); context.cookie = null;
  if (mongoose.connection.name !== "mmm-test-activities") throw new Error("Unexpected integration database.");
  for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({});
  owner = await registerOwner(registration, null); context.cookie = `mmm_session=${owner.session.token}`;
});
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); vi.unstubAllEnvs(); });
test("manual CRUD preserves authorship/time/order, strips forged fields, clears optional values and deletes only its record", async () => {
  const event = await createEvent(eventInput);
  const activity = await createActivity({ ...input, relatedEventId: event.id, sourceType: "SYSTEM", createdBy: "forged", createdAt: "forged", weddingId: "forged" });
  expect(activity).toMatchObject({ sourceType: "MANUAL", createdBy: owner.user.id, authorName: "Sai", canModify: true, event: { id: event.id, name: "Haldi" } });
  expect(activity).not.toHaveProperty("weddingId"); expect(activity).not.toHaveProperty("passwordHash");
  const newer = await createActivity({ title: "Newer update" });
  const updated = await updateActivity(activity.id, { title: "Edited", createdBy: "forged", createdAt: "forged", sourceType: "SYSTEM" });
  expect(updated).toMatchObject({ title: "Edited", description: input.description, activityType: "Wardrobe", createdAt: activity.createdAt, createdBy: activity.createdBy });
  expect((await listActivities()).activities[0].id).toBe(newer.id);
  const cleared = await updateActivity(activity.id, { description: null, relatedEventId: "", activityType: " " });
  expect(cleared.description).toBeUndefined(); expect(cleared.event).toBeUndefined(); expect(cleared.activityType).toBeUndefined();
  await deleteActivity(activity.id); await expect(getActivity(activity.id)).rejects.toMatchObject({ status: 404 });
  expect(await EventModel.countDocuments()).toBe(1); expect((await getActivity(newer.id)).title).toBe("Newer update");
});
test("literal title/description search, source/event filters, stable pagination and bounded recent preview", async () => {
  const event = await createEvent(eventInput);
  await createActivity({ ...input, relatedEventId: event.id }); await createActivity({ title: "Wedding-wide", description: "literal (details)" });
  for (const search of ["[QA]", "శుభం", "(details)"]) expect((await listActivities(new URLSearchParams({ search }))).activities).toHaveLength(1);
  expect((await listActivities(new URLSearchParams({ sourceType: "MANUAL", relatedEventId: event.id }))).activities).toHaveLength(1);
  expect((await listActivities(new URLSearchParams("relatedEventId=wedding-wide"))).activities).toHaveLength(1);
  const result = await listActivities(new URLSearchParams("limit=1&page=2")); expect(result.pagination).toMatchObject({ total: 3, pages: 3 }); expect(result.activities).toHaveLength(1); expect(result.events).toEqual([{ id: event.id, name: "Haldi" }]);
  for (const query of ["page=0", "limit=101", "sourceType=AUTOMATIC", "relatedEventId=bad", `search=${"x".repeat(121)}`]) await expect(listActivities(new URLSearchParams(query))).rejects.toMatchObject({ status: 400 });
  for (let i = 0; i < 3; i++) await createActivity({ title: `Preview ${i}` });
  expect((await recentActivities()).activities.map(value => value.title)).toEqual(["Preview 2", "Preview 1", "Preview 0"]);
});
test("cross-wedding scope, safe referenced names and family own-versus-other/manual-versus-system permissions", async () => {
  const activity = await createActivity(input), event = await createEvent(eventInput);
  const other = await registerOwner({ ...registration, name: "Other member", email: "other-activity@example.com" }, null); context.cookie = `mmm_session=${other.session.token}`;
  expect((await listActivities(new URLSearchParams({ weddingId: owner.user.weddingId }))).activities).toHaveLength(0);
  for (const action of [() => getActivity(activity.id), () => updateActivity(activity.id, input), () => deleteActivity(activity.id)]) await expect(action()).rejects.toMatchObject({ status: 404 });
  await expect(createActivity({ ...input, relatedEventId: event.id })).rejects.toMatchObject({ status: 400 });
  await UserModel.updateOne({ _id: other.user.id }, { weddingId: owner.user.weddingId, role: "FAMILY_MEMBER" });
  const own = await createActivity({ title: "Family update" }); expect(own.canModify).toBe(true);
  await updateActivity(own.id, { title: "Family edited" });
  expect((await getActivity(activity.id)).canModify).toBe(false);
  for (const action of [() => updateActivity(activity.id, input), () => deleteActivity(activity.id)]) await expect(action()).rejects.toMatchObject({ status: 403 });
  await deleteActivity(own.id); context.cookie = `mmm_session=${owner.session.token}`;
  const automatic = (await listActivities(new URLSearchParams("sourceType=SYSTEM"))).activities[0];
  for (const role of ["OWNER", "ADMIN", "FAMILY_MEMBER"]) {
    await UserModel.updateOne({ _id: owner.user.id }, { role }); expect((await getActivity(automatic.id)).canModify).toBe(false);
    for (const action of [() => updateActivity(automatic.id, input), () => deleteActivity(automatic.id)]) await expect(action()).rejects.toMatchObject({ status: 403 });
  }
  await UserModel.updateOne({ _id: owner.user.id }, { role: "ADMIN" }); expect((await updateActivity(activity.id, { title: "Admin edit" })).title).toBe("Admin edit");
});
test("automatic event/task/expense/guest updates reflect actual changes without no-op completion/attendance duplicates", async () => {
  expect((await listActivities()).activities).toHaveLength(0);
  const event = await createEvent(eventInput), task = await createTask({ title: "Book photographer", eventId: event.id });
  await updateTaskStatus(task.id, { status: "COMPLETED" }); await updateTaskStatus(task.id, { status: "COMPLETED" }); await updateTask(task.id, { description: "Still complete" });
  await createExpense({ name: "Catering", category: "Food", amount: 25000, eventId: event.id });
  const guest = await createGuest({ name: "Rajesh", rsvpStatus: "PENDING" }); await updateGuest(guest.id, { notes: "Contact later" }); await updateGuest(guest.id, { rsvpStatus: "ATTENDING", numberAttending: 0 }); await updateGuest(guest.id, { rsvpStatus: "ATTENDING", numberAttending: 0 });
  const result = await listActivities(); expect(result.activities).toHaveLength(5); expect(result.activities.every(record => record.sourceType === "SYSTEM" && !record.canModify)).toBe(true);
  expect(result.activities.map(record => record.activityType).sort()).toEqual(["Events", "Expenses", "Guests", "Guests", "Tasks"]);
  expect(result.activities.find(record => record.activityType === "Expenses")?.description).toContain("25,000"); expect(result.activities.find(record => record.activityType === "Tasks")?.event?.id).toBe(event.id);
  await updateTaskStatus(task.id, { status: "TODO" }); await updateTask(task.id, { status: "COMPLETED" });
  expect((await listActivities()).activities).toHaveLength(6); // A real second completion is another update.
  await createTask({ title: "Already completed", status: "COMPLETED" }); expect((await listActivities()).activities).toHaveLength(7);
});
test("failed automatic recording rolls back the planning mutation and preserves existing state", async () => {
  const task = await createTask({ title: "Task" }), guest = await createGuest({ name: "Guest", rsvpStatus: "PENDING" });
  for (const operation of [() => createEvent(eventInput), () => createExpense({ name: "Expense", category: "Food", amount: 10 }), () => createGuest({ name: "New guest", rsvpStatus: "PENDING" }), () => updateTaskStatus(task.id, { status: "COMPLETED" }), () => updateGuest(guest.id, { rsvpStatus: "ATTENDING" })]) {
    vi.spyOn(ActivityModel, "create").mockRejectedValueOnce(new Error("Injected recording failure"));
    await expect(operation()).rejects.toThrow("Injected recording failure"); vi.restoreAllMocks();
  }
  expect(await EventModel.countDocuments()).toBe(0); expect(await ExpenseModel.countDocuments()).toBe(0); expect(await GuestModel.countDocuments()).toBe(1);
  expect((await getTask(task.id)).status).toBe("TODO"); expect((await getGuest(guest.id)).rsvpStatus).toBe("PENDING"); expect(await TaskModel.countDocuments()).toBe(1);
  expect(await ActivityModel.countDocuments()).toBe(1);
});
test("event deletion retains manual/system updates and concurrent linking cannot leave dangling references", async () => {
  const event = await createEvent(eventInput), activity = await createActivity({ ...input, relatedEventId: event.id });
  await deleteEvent(event.id); const retained = await getActivity(activity.id); expect(retained.createdAt).toBe(activity.createdAt); expect(retained.relatedEventId).toBeUndefined(); expect((await listActivities()).activities).toHaveLength(2);
  const concurrent = await createEvent({ ...eventInput, name: "Concurrent event" });
  await Promise.allSettled([createActivity({ ...input, relatedEventId: concurrent.id }), deleteEvent(concurrent.id)]);
  expect(await EventModel.findById(concurrent.id)).toBeNull(); expect(await ActivityModel.countDocuments({ relatedEventId: concurrent.id })).toBe(0);
});
test("concurrent partial edits preserve omitted fields and creation time", async () => {
  const activity = await createActivity(input);
  await Promise.all([updateActivity(activity.id, { description: "Changed notes" }), updateActivity(activity.id, { activityType: "Decor" })]);
  expect(await getActivity(activity.id)).toMatchObject({ description: "Changed notes", activityType: "Decor", createdAt: activity.createdAt });
});
test("HTTP auth/origin/body bounds/statuses, safe partial dashboard failure, and durable limits", async () => {
  expect((await POST(request("POST", input, "https://evil.example"))).status).toBe(403);
  expect((await POST(request("POST", { ...input, description: "x".repeat(33000) }))).status).toBe(413);
  expect((await POST(request("POST", { title: " " }))).status).toBe(400);
  const response = await POST(request("POST", input)); expect(response.status).toBe(201); const { data } = await response.json();
  expect((await PUT(request("PUT", { description: "Updated" }), routeContext(data.id))).status).toBe(200); expect((await DELETE(request("DELETE"), routeContext(data.id))).status).toBe(204);
  context.cookie = null; expect((await GET(request())).status).toBe(401); expect((await POST(request("POST", input))).status).toBe(401); context.cookie = `mmm_session=${owner.session.token}`;
  const spy = vi.spyOn(ActivityModel, "find").mockImplementationOnce(() => { throw new Error("secret driver detail"); }); vi.spyOn(console, "error").mockImplementation(() => {});
  const failed = await (await dashboard(new Request("http://localhost:3000/api/v1/dashboard"))).json(); expect(failed.data.activities).toEqual({ status: "error", data: null }); expect(failed.data.tasks.status).toBe("ready"); expect(JSON.stringify(failed)).not.toContain("secret"); spy.mockRestore();
  expect((await (await dashboard(new Request("http://localhost:3000/api/v1/dashboard?section=activities"))).json()).data.activities).toEqual([]);
  await mongoose.connection.collection("rate_limits").deleteMany({}); vi.spyOn(Date, "now").mockReturnValue(Date.now());
  for (let i = 0; i < 60; i++) await createActivity({ title: `Rate ${i}` });
  const blocked = await POST(request("POST", input)); expect(blocked.status).toBe(429); expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
});
