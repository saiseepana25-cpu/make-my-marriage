import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { registerOwner } from "@/features/auth/service";
import { ensureAuthIndexes } from "@/features/auth/indexes";
import { updateCurrentWedding } from "@/features/weddings/service";
import { GET, PUT } from "@/app/api/v1/weddings/current/route";
import { WeddingModel } from "@/models/wedding";
import { UserModel } from "@/models/user";
import { EventModel } from "@/models/event";
import { ActivityModel } from "@/models/activity";
const context = vi.hoisted(() => ({ cookie: null as string | null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(context.cookie ? { cookie: context.cookie } : {}) }));
let originalSlug: string;
let mongo: MongoMemoryReplSet, owner: Awaited<ReturnType<typeof registerOwner>>;
const registration = { name: "Sai", email: "settings@example.com", password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } };
const request = (body: unknown, origin = "http://localhost:3000") => new Request("http://localhost:3000/api/v1/weddings/current", { method: "PUT", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  vi.stubEnv("MONGODB_URI", mongo.getUri("mmm-test-weddings")); vi.stubEnv("MONGODB_DB_NAME", "mmm-test-weddings");
  vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "test-only-".repeat(8)); vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"); vi.stubEnv("NODE_ENV", "development");
  await ensureAuthIndexes();
});
beforeEach(async () => {
  vi.restoreAllMocks(); context.cookie = null;
  if (mongoose.connection.name !== "mmm-test-weddings") throw new Error("Unexpected integration database.");
  for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({});
  owner = await registerOwner(registration, null); context.cookie = `mmm_session=${owner.session.token}`;
  originalSlug = (await WeddingModel.findById(owner.user.weddingId).lean())!.websiteSlug;
});
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); vi.unstubAllEnvs(); });
test("names/date/location persist without changing slug, budget, optional content or events", async () => {
  await WeddingModel.updateOne({ _id: owner.user.weddingId }, { $set: { totalBudget: 500000, story: "Our story", coverImageKey: "private/cover" } });
  const event = await EventModel.create({ weddingId: owner.user.weddingId, createdBy: owner.user.id, name: "Haldi", venue: "Family Hall", startAt: new Date("2027-02-28T10:00:00Z") });
  const result = await PUT(request({ groomName: "Sai Kumar", brideName: "Adya Devi", weddingDate: "2020-02-29", location: "విజయవాడ" }));
  expect(result.status).toBe(200); const body = await result.json();
  expect(body.data).toMatchObject({ groomName: "Sai Kumar", brideName: "Adya Devi", weddingDate: "2020-02-29T00:00:00.000Z", location: "విజయవాడ" });
  expect(Object.keys(body.data).sort()).toEqual(["id", "brideName", "groomName", "weddingDate", "location", "websiteSlug"].sort());
  const saved = await WeddingModel.findById(owner.user.weddingId).lean();
  expect(saved).toMatchObject({ totalBudget: 500000, story: "Our story", coverImageKey: "private/cover", websiteSlug: originalSlug });
  expect(await EventModel.findById(event._id).lean()).toMatchObject({ venue: "Family Hall", startAt: event.startAt });
  expect(await ActivityModel.countDocuments()).toBe(0); expect((await (await GET()).json()).data).toEqual(body.data);
});
test("scope and restricted fields cannot be supplied by the browser", async () => {
  const foreign = await registerOwner({ ...registration, email: "foreign@example.com", wedding: { ...registration.wedding, groomName: "Other" } }, null);
  const result = await PUT(request({ location: "Mumbai", weddingId: foreign.user.weddingId, id: foreign.user.weddingId, websiteSlug: "forged", createdBy: foreign.user.id, totalBudget: 1, story: "forged" }));
  expect(result.status).toBe(200); expect((await WeddingModel.findById(foreign.user.weddingId).lean())?.location).toBe("Hyderabad");
  const own = await WeddingModel.findById(owner.user.weddingId).lean(); expect(own?.location).toBe("Mumbai"); expect(own?.websiteSlug).toBe(originalSlug); expect(own?.totalBudget).toBeUndefined(); expect(own?.story).toBeUndefined();
});
test("family reads only, admins may edit, and anonymous access is denied", async () => {
  context.cookie = null; expect((await GET()).status).toBe(401); expect((await PUT(request({ location: "Mumbai" }))).status).toBe(401);
  context.cookie = `mmm_session=${owner.session.token}`;
  await UserModel.updateOne({ _id: owner.user.id }, { $set: { role: "FAMILY_MEMBER" } });
  expect((await GET()).status).toBe(200); expect((await PUT(request({ location: "Mumbai" }))).status).toBe(403);
  await UserModel.updateOne({ _id: owner.user.id }, { $set: { role: "ADMIN" } }); expect((await PUT(request({ location: "Mumbai" }))).status).toBe(200);
});
test("invalid input/origin/body bounds do not change saved data", async () => {
  for (const input of [{ groomName: " " }, { brideName: "x".repeat(101) }, { location: "x".repeat(201) }, { weddingDate: "2027-02-29" }, { weddingDate: "2027-02-28T00:00:00Z" }, { location: null }, { websiteSlug: "new" }]) expect((await PUT(request(input))).status).toBe(400);
  expect((await PUT(request({ location: "Mumbai" }, "https://foreign.example"))).status).toBe(403);
  expect((await PUT(request({ location: "శు".repeat(10000) }))).status).toBe(413);
  expect((await WeddingModel.findById(owner.user.weddingId).lean())?.location).toBe("Hyderabad");
});
test("atomic partial updates preserve concurrent changes to other wedding fields", async () => {
  await Promise.all([updateCurrentWedding({ groomName: "New Groom" }), updateCurrentWedding({ location: "Chennai" }), WeddingModel.updateOne({ _id: owner.user.weddingId }, { $set: { totalBudget: 123456 } })]);
  expect(await WeddingModel.findById(owner.user.weddingId).lean()).toMatchObject({ groomName: "New Groom", brideName: "Adya", location: "Chennai", totalBudget: 123456, websiteSlug: originalSlug });
});
test("wedding updates use a durable per-user mutation limit", async () => {
  for (let i = 0; i < 60; i++) expect((await PUT(request({ location: "Mumbai" }))).status).toBe(200);
  const denied = await PUT(request({ location: "Chennai" })); expect(denied.status).toBe(429); expect(Number(denied.headers.get("retry-after"))).toBeGreaterThan(0);
  expect((await WeddingModel.findById(owner.user.weddingId).lean())?.location).toBe("Mumbai");
});
