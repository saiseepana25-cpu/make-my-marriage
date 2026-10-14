import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { ensureAuthIndexes } from "@/features/auth/indexes";
import { registerOwner } from "@/features/auth/service";
import { updateCurrentWedding } from "@/features/weddings/service";
import { WeddingModel } from "@/models/wedding";
import { EventModel } from "@/models/event";
import { GET as readWedding } from "@/app/api/v1/public/weddings/[slug]/route";
import { GET as readEvents } from "@/app/api/v1/public/weddings/[slug]/events/route";

const context = vi.hoisted(() => ({ cookie: null as string | null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(context.cookie ? { cookie: context.cookie } : {}) }));
let mongo: MongoMemoryReplSet, owner: Awaited<ReturnType<typeof registerOwner>>, slug: string;
const registration = { name: "Private owner", email: "website@example.com", password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } };
const params = () => ({ params: Promise.resolve({ slug }) });
const request = (query = "") => new Request(`http://localhost:3000/api/v1/public/weddings/${slug}/events${query}`);
beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  vi.stubEnv("MONGODB_URI", mongo.getUri("mmm-test-website")); vi.stubEnv("MONGODB_DB_NAME", "mmm-test-website");
  vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "test-only-".repeat(8)); vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"); vi.stubEnv("NODE_ENV", "development");
  await ensureAuthIndexes();
});
beforeEach(async () => {
  vi.restoreAllMocks(); context.cookie = null;
  if (mongoose.connection.name !== "mmm-test-website") throw new Error("Unexpected integration database.");
  for (const collection of Object.values(mongoose.connection.collections)) await collection.deleteMany({});
  owner = await registerOwner(registration, null);
  slug = (await WeddingModel.findById(owner.user.weddingId).lean())!.websiteSlug;
});
afterAll(async () => { await mongoose.disconnect(); await mongo?.stop(); vi.unstubAllEnvs(); });

test("anonymous wedding reads explicitly exclude finance, authors, storage and private content", async () => {
  await WeddingModel.updateOne({ _id: owner.user.weddingId }, { $set: { totalBudget: 123456, coverImageKey: "private/cover", story: "Deferred story" } });
  const response = await readWedding(request(), params()); expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
  const body = await response.json();
  expect(body.data).toEqual({ groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28T00:00:00.000Z", location: "Hyderabad", websiteSlug: slug });
  expect(JSON.stringify(body)).not.toMatch(/Private owner|website@example|private\/cover|Deferred story|123456|passwordHash|createdBy|totalBudget|weddingId/);
});

test("public events are scoped by slug, chronologically paginated and guest safe regardless of cookie", async () => {
  const other = await registerOwner({ ...registration, email: "other@example.com", wedding: { ...registration.wedding, groomName: "Other" } }, null);
  for (const [name, day] of [["Reception", 28], ["Mehendi", 26], ["Haldi", 27]] as const) await EventModel.create({ weddingId: owner.user.weddingId, createdBy: owner.user.id, name, venue: "Saved venue", location: "Saved address", description: "Guest event information", startAt: new Date(`2027-02-${day}T10:00:00Z`), livestreamUrl: "https://example.com/live", status: "Private status" });
  await EventModel.create({ weddingId: other.user.weddingId, createdBy: other.user.id, name: "Foreign event", venue: "Foreign venue", startAt: new Date("2027-01-01T00:00:00Z") });
  context.cookie = `mmm_session=${other.session.token}`;
  const response = await readEvents(request(`?page=1&limit=2&weddingId=${other.user.weddingId}`), params()); const body = await response.json();
  expect(body.data.events.map((e: { name: string }) => e.name)).toEqual(["Mehendi", "Haldi"]); expect(body.data.pagination).toEqual({ page: 1, limit: 2, total: 3, pages: 2 });
  expect(Object.keys(body.data.events[0]).sort()).toEqual(["id", "name", "startAt", "venue", "location", "description", "livestreamUrl"].sort());
  expect(JSON.stringify(body)).not.toMatch(/Foreign|weddingId|createdBy|createdAt|updatedAt|Private status/);
  expect((await (await readEvents(request("?page=2&limit=2"), params())).json()).data.events.map((e: { name: string }) => e.name)).toEqual(["Reception"]);
});

test("saved identity/event changes are visible through the original stable link, including past dates", async () => {
  context.cookie = `mmm_session=${owner.session.token}`;
  await updateCurrentWedding({ groomName: "Sai Kumar", weddingDate: "2020-02-29", location: "విజయవాడ" });
  const event = await EventModel.create({ weddingId: owner.user.weddingId, createdBy: owner.user.id, name: "Old celebration", venue: "Saved venue", startAt: new Date("2020-02-28T19:00:00Z"), endAt: new Date("2020-02-28T20:00:00Z") });
  context.cookie = null; expect((await (await readWedding(request(), params())).json()).data).toMatchObject({ groomName: "Sai Kumar", websiteSlug: slug, weddingDate: "2020-02-29T00:00:00.000Z", location: "విజయవాడ" });
  await EventModel.updateOne({ _id: event._id }, { $set: { venue: "Updated venue", livestreamUrl: "javascript:alert(1)" } });
  const data = (await (await readEvents(request(), params())).json()).data; expect(data.events[0]).toMatchObject({ venue: "Updated venue", endAt: "2020-02-28T20:00:00.000Z" }); expect(data.events[0]).not.toHaveProperty("livestreamUrl");
  await EventModel.deleteOne({ _id: event._id }); expect((await (await readEvents(request(), params())).json()).data.events).toEqual([]);
});

test("invalid/missing slugs are unavailable and pagination is strictly bounded", async () => {
  for (const invalid of ["invalid!slug", "missing-wedding", "x".repeat(121)]) {
    const response = await readWedding(request(), { params: Promise.resolve({ slug: invalid }) }); expect(response.status).toBe(404); expect((await response.json()).error.code).toBe("NOT_FOUND");
  }
  for (const query of ["?page=0", "?page=1.5", "?limit=101", "?limit=-1", "?page=1000001"]) expect((await readEvents(request(query), params())).status).toBe(400);
  const empty = (await (await readEvents(request(), params())).json()).data; expect(empty).toEqual({ events: [], pagination: { page: 1, limit: 20, total: 0, pages: 0 } });
});

test("event read errors are generic while wedding identity remains independently readable", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(EventModel, "find").mockImplementationOnce(() => { throw new Error("secret database credentials"); });
  const response = await readEvents(request(), params()); expect(response.status).toBe(500); expect(await response.json()).toMatchObject({ success: false, data: null, error: { code: "INTERNAL_ERROR" } });
  expect((await readWedding(request(), params())).status).toBe(200); expect(JSON.stringify(log.mock.calls)).not.toContain("secret database credentials");
});
