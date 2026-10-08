import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { registerOwner } from "@/features/auth/service";
import { ensureAuthIndexes } from "@/features/auth/indexes";
import { createGuest, updateGuest, deleteGuest, getGuest, listGuests, guestSummary, guestFamilies } from "@/features/guests/service";
import { GuestModel } from "@/models/guest";
import { UserModel } from "@/models/user";
import { POST, GET } from "@/app/api/v1/guests/route";
import { PUT, DELETE, GET as GETGuest } from "@/app/api/v1/guests/[guestId]/route";
import { GET as GETSummary } from "@/app/api/v1/guests/summary/route";
import { GET as GETDashboard } from "@/app/api/v1/dashboard/route";
const context = vi.hoisted(() => ({ cookie: null as string | null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(context.cookie ? { cookie: context.cookie } : {}) }));
let mongo: MongoMemoryReplSet, owner: Awaited<ReturnType<typeof registerOwner>>;
const registration = { name: "Sai", email: "guest@example.com", password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } };
const input = { name: "Rajesh Sharma", familyName: "Sharma Family", rsvpStatus: "PENDING" };
const routeContext = (guestId: string) => ({ params: Promise.resolve({ guestId }) });
const request = (method = "GET", body?: unknown, origin = "http://localhost:3000") => new Request("http://localhost:3000/api/v1/guests", { method, headers: { origin, "content-type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  vi.stubEnv("MONGODB_URI", mongo.getUri("mmm-test-guests")); vi.stubEnv("MONGODB_DB_NAME", "mmm-test-guests"); vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "test-only-".repeat(8)); vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"); vi.stubEnv("NODE_ENV", "development"); await ensureAuthIndexes();
});
beforeEach(async () => {
  vi.restoreAllMocks(); context.cookie = null;
  if (mongoose.connection.name !== "mmm-test-guests") throw new Error("Unexpected integration database.");
  for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({});
  owner = await registerOwner(registration, null); context.cookie = `mmm_session=${owner.session.token}`;
});
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); vi.unstubAllEnvs(); });
test("persisted CRUD uses safe fields, explicit zero/clearing, preserves omitted fields and attendance timestamps", async () => {
  const guest = await createGuest({ ...input, email: " TEST@EXAMPLE.COM ", phone: "+91 98201 44521", numberInvited: 0, notes: "శుభం", weddingId: "forged", rsvpUpdatedAt: "forged" });
  expect(guest).toMatchObject({ email: "test@example.com", numberInvited: 0 }); expect(guest.numberAttending).toBeUndefined(); expect(guest).not.toHaveProperty("weddingId"); expect(guest).not.toHaveProperty("createdBy");
  expect((await GuestModel.findById(guest.id).lean())?.weddingId.toString()).toBe(owner.user.weddingId); expect(await getGuest(guest.id)).toEqual(guest);
  const contact = await updateGuest(guest.id, { phone: "new contact", numberInvited: 2, rsvpUpdatedAt: "forged" }); expect(contact.rsvpUpdatedAt).toBe(guest.rsvpUpdatedAt); expect(contact.notes).toBe("శుభం");
  const attendance = await updateGuest(guest.id, { rsvpStatus: "ATTENDING", numberAttending: 0 }); expect(attendance.numberAttending).toBe(0); expect(attendance.rsvpUpdatedAt).not.toBe(guest.rsvpUpdatedAt);
  expect((await updateGuest(guest.id, { rsvpStatus: "ATTENDING", numberAttending: 0 })).rsvpUpdatedAt).toBe(attendance.rsvpUpdatedAt);
  const cleared = await updateGuest(guest.id, { phone: "", email: null, familyName: "", numberInvited: null, numberAttending: null, notes: null });
  expect(cleared.name).toBe(input.name); for (const field of ["phone", "email", "familyName", "numberInvited", "numberAttending", "notes"] as const) expect(cleared[field]).toBeUndefined();
  await expect(updateGuest(guest.id, { numberAttending: -1 })).rejects.toMatchObject({ status: 400 });
  await deleteGuest(guest.id); await expect(getGuest(guest.id)).rejects.toMatchObject({ status: 404 });
});
test("counts are wedding-global records and deletion leaves other guests sharing the family name intact", async () => {
  expect(await guestSummary()).toEqual({ total: 0, pending: 0, attending: 0, notAttending: 0 });
  const first = await createGuest({ ...input, numberInvited: 99, numberAttending: 77 });
  const other = await createGuest({ ...input, name: "Kavita Sharma", rsvpStatus: "ATTENDING" }); await createGuest({ ...input, name: "Rohan", familyName: null, rsvpStatus: "NOT_ATTENDING" });
  expect(await guestSummary()).toEqual({ total: 3, pending: 1, attending: 1, notAttending: 1 });
  await listGuests(new URLSearchParams("rsvpStatus=NOT_ATTENDING&limit=1")); expect((await guestSummary()).total).toBe(3);
  expect((await (await GETDashboard(new Request("http://localhost:3000/api/v1/dashboard?section=guests"))).json()).data.total).toBe(3);
  await deleteGuest(first.id); expect((await getGuest(other.id)).familyName).toBe("Sharma Family"); expect(await guestSummary()).toEqual({ total: 2, pending: 0, attending: 1, notAttending: 1 });
});
test("literal contact/name/family search, exact family/no-family, pagination and invalid filters", async () => {
  await createGuest({ ...input, name: "Guest [QA]", phone: "+91 100", email: "test@example.com" }); await createGuest({ ...input, name: "No family", familyName: null, rsvpStatus: "ATTENDING" }); await createGuest({ ...input, name: "Family named no-family", familyName: "no-family" });
  for (const search of ["[QA]", "+91 100", "test@example.com"]) expect((await listGuests(new URLSearchParams({ search }))).guests).toHaveLength(1);
  expect((await listGuests(new URLSearchParams("search=Sharma&familyName=Sharma+Family&rsvpStatus=PENDING"))).guests).toHaveLength(1);
  expect((await listGuests(new URLSearchParams("withoutFamily=true"))).guests.map(guest => guest.name)).toEqual(["No family"]);
  expect((await listGuests(new URLSearchParams("familyName=no-family"))).guests).toHaveLength(1);
  expect(await guestFamilies()).toEqual(["no-family", "Sharma Family"]);
  const page = await listGuests(new URLSearchParams("page=2&limit=1")); expect(page.pagination).toMatchObject({ total: 3, pages: 3 }); expect(page.guests).toHaveLength(1);
  for (const query of ["rsvpStatus=bad", "withoutFamily=false", "withoutFamily=true&familyName=x", "page=0", "limit=101"]) await expect(listGuests(new URLSearchParams(query))).rejects.toMatchObject({ status: 400 });
});
test("tenant isolation and OWNER/ADMIN/FAMILY policies cannot be bypassed by supplied scope", async () => {
  const guest = await createGuest(input), other = await registerOwner({ ...registration, email: "other-guest@example.com" }, null); context.cookie = `mmm_session=${other.session.token}`;
  expect((await listGuests(new URLSearchParams({ weddingId: owner.user.weddingId }))).guests).toHaveLength(0); expect((await guestSummary()).total).toBe(0); expect(await guestFamilies()).toEqual([]);
  for (const action of [() => getGuest(guest.id), () => updateGuest(guest.id, { name: "Forged" }), () => deleteGuest(guest.id)]) await expect(action()).rejects.toMatchObject({ status: 404 });
  context.cookie = `mmm_session=${owner.session.token}`; await UserModel.updateOne({ _id: owner.user.id }, { role: "FAMILY_MEMBER" }); expect((await getGuest(guest.id)).name).toBe(input.name);
  for (const action of [() => createGuest(input), () => updateGuest(guest.id, { name: "Denied" }), () => deleteGuest(guest.id)]) await expect(action()).rejects.toMatchObject({ status: 403 });
  await UserModel.updateOne({ _id: owner.user.id }, { role: "ADMIN" }); expect((await updateGuest(guest.id, { name: "Admin edit" })).name).toBe("Admin edit");
});
test("concurrent partial edits preserve unrelated values", async () => {
  const guest = await createGuest(input);
  await Promise.all([updateGuest(guest.id, { phone: "123" }), updateGuest(guest.id, { notes: "Concurrent note" })]);
  expect(await getGuest(guest.id)).toMatchObject({ phone: "123", notes: "Concurrent note" });
});
test("HTTP auth/origin/body validation, sanitized failure and durable rate limit", async () => {
  expect((await POST(request("POST", input, "https://evil.example"))).status).toBe(403);
  expect((await POST(request("POST", { ...input, notes: "x".repeat(33000) }))).status).toBe(413);
  expect((await POST(request("POST", { ...input, email: "bad@" }))).status).toBe(400);
  const response = await POST(request("POST", input)); expect(response.status).toBe(201); const { data } = await response.json();
  expect((await GETGuest(request(), routeContext("bad"))).status).toBe(400); expect((await PUT(request("PUT", { numberInvited: 1.5 }), routeContext(data.id))).status).toBe(400);
  expect((await DELETE(request("DELETE"), routeContext(data.id))).status).toBe(204);
  context.cookie = null; for (const action of [() => GET(request()), () => GETSummary(), () => POST(request("POST", input))]) expect((await action()).status).toBe(401);
  context.cookie = `mmm_session=${owner.session.token}`;
  const spy = vi.spyOn(GuestModel, "aggregate").mockRejectedValue(new Error("secret driver details")); vi.spyOn(console, "error").mockImplementation(() => {});
  const failed = await (await GETDashboard(new Request("http://localhost:3000/api/v1/dashboard"))).json(); expect(failed.data.guests).toEqual({ status: "error", data: null }); expect(failed.data.tasks.status).toBe("ready"); expect(JSON.stringify(failed)).not.toContain("secret"); spy.mockRestore();
  await mongoose.connection.collection("rate_limits").deleteMany({}); vi.spyOn(Date, "now").mockReturnValue(Date.now());
  for (let i = 0; i < 60; i++) await createGuest({ ...input, name: `Guest ${i}` });
  const blocked = await POST(request("POST", input)); expect(blocked.status).toBe(429); expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
});
