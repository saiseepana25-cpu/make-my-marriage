import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server-core";
import { registerOwner, loginUser } from "@/features/auth/service";
import { getCurrentUser } from "@/features/auth/current-user";
import { getCurrentWedding } from "@/features/weddings/service";
import { sessionService, hashSessionToken } from "@/features/auth/session";
import { rateLimiter } from "@/services/rate-limit/rate-limiter";
import { UserModel } from "@/models/user";
import { WeddingModel } from "@/models/wedding";
import { SessionModel } from "@/models/session";
import { RateLimitModel } from "@/models/rate-limit";
import { ensureAuthIndexes } from "@/features/auth/indexes";
import { POST as register } from "@/app/api/v1/auth/register/route";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as logout } from "@/app/api/v1/auth/logout/route";

const context = vi.hoisted(() => ({ cookie: null as string | null }));
vi.mock("next/headers", () => ({ headers: async () => new Headers(context.cookie ? { cookie: context.cookie } : {}) }));

let mongo: MongoMemoryReplSet;
const input = {
  name: "Priya", email: "priya@example.com", password: "12345678", relationshipType: "BRIDE",
  wedding: { brideName: "Priya", groomName: "Sai", weddingDate: "2027-02-28", location: "Hyderabad" },
};
const request = (path: string, body: unknown, cookie?: string) => new Request(`http://localhost:3000/api/v1/auth/${path}`, {
  method: "POST", headers: { origin: "http://localhost:3000", "content-type": "application/json", ...(cookie ? { cookie } : {}) },
  body: JSON.stringify(body),
});

beforeAll(async () => {
  mongo = await MongoMemoryReplSet.create({ replSet: { count: 1, storageEngine: "wiredTiger" } });
  vi.stubEnv("MONGODB_URI", mongo.getUri("mmm-test-auth"));
  vi.stubEnv("MONGODB_DB_NAME", "mmm-test-auth");
  vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "test-only-".repeat(8));
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  vi.stubEnv("NODE_ENV", "development");
  await ensureAuthIndexes();
});

beforeEach(async () => {
  context.cookie = null;
  // Only our fresh ephemeral test server, never an application/Atlas database.
  if (mongoose.connection.name !== "mmm-test-auth") throw new Error("Unexpected integration database.");
  await Promise.all([UserModel.deleteMany({}), WeddingModel.deleteMany({}), SessionModel.deleteMany({}), RateLimitModel.deleteMany({})]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
  vi.unstubAllEnvs();
});

test("registration atomically creates an OWNER, wedding and hashed 30-day session", async () => {
  const before = Date.now();
  const result = await registerOwner({ ...input, role: "ADMIN", weddingId: new mongoose.Types.ObjectId().toString() }, null);
  expect(result.user).toMatchObject({ name: "Priya", role: "OWNER", email: "priya@example.com" });
  expect(result.user).not.toHaveProperty("passwordHash");
  expect(result.session.expiresAt.getTime() - before).toBeGreaterThanOrEqual(2_592_000_000);
  const user = await UserModel.findById(result.user.id).select("+passwordHash").lean();
  const wedding = await WeddingModel.findById(result.user.weddingId).lean();
  const session = await SessionModel.findOne({ userId: result.user.id }).lean();
  expect(user?.passwordHash).not.toBe(input.password);
  expect(wedding?.createdBy.toString()).toBe(result.user.id);
  expect(wedding?.weddingDate.toISOString()).toBe("2027-02-28T00:00:00.000Z");
  expect(session?.tokenHash).toBe(hashSessionToken(result.session.token));
  expect(JSON.stringify(session)).not.toContain(result.session.token);
  expect(await sessionService.read(`mmm_session=${result.session.token}`)).toEqual({ userId: result.user.id });
});

test("session-write failure rolls back the wedding and owner", async () => {
  vi.spyOn(SessionModel, "create").mockRejectedValueOnce(new Error("Injected persistence failure"));
  await expect(registerOwner(input, null)).rejects.toThrow("Injected persistence failure");
  expect(await UserModel.countDocuments()).toBe(0);
  expect(await WeddingModel.countDocuments()).toBe(0);
  expect(await SessionModel.countDocuments()).toBe(0);
});

test("concurrent duplicate signups cannot create orphan weddings", async () => {
  const results = await Promise.allSettled([registerOwner(input, null), registerOwner(input, null)]);
  expect(results.filter(result => result.status === "fulfilled")).toHaveLength(1);
  expect(await UserModel.countDocuments()).toBe(1);
  expect(await WeddingModel.countDocuments()).toBe(1);
  expect(await SessionModel.countDocuments()).toBe(1);
});

test("login replaces the browser session and logout revokes it server-side", async () => {
  const original = await registerOwner(input, null);
  const next = await loginUser({ email: " PRIYA@EXAMPLE.COM ", password: input.password }, `mmm_session=${original.session.token}`);
  expect(next.session.token).not.toBe(original.session.token);
  expect(await sessionService.read(`mmm_session=${original.session.token}`)).toBeNull();
  await sessionService.revoke(`mmm_session=${next.session.token}`);
  expect(await sessionService.read(`mmm_session=${next.session.token}`)).toBeNull();
  await expect(loginUser({ email: input.email, password: "incorrect" }, null)).rejects.toMatchObject({ status: 401 });
  await expect(loginUser({ email: "missing@example.com", password: "incorrect" }, null)).rejects.toMatchObject({ status: 401 });
});

test("expired and forged sessions never grant access; deleted weddings invalidate membership", async () => {
  const result = await registerOwner(input, null);
  const cookie = `mmm_session=${result.session.token}`;
  context.cookie = cookie;
  expect((await getCurrentUser())?.id).toBe(result.user.id);
  expect((await getCurrentWedding()).brideName).toBe("Priya");
  await SessionModel.updateOne({ userId: result.user.id }, { expiresAt: new Date(Date.now() - 1000) });
  expect(await sessionService.read(cookie)).toBeNull();
  expect(await sessionService.read(`mmm_session=${"X".repeat(43)}`)).toBeNull();
  const fresh = await sessionService.create(result.user.id);
  context.cookie = `mmm_session=${fresh.token}`;
  await WeddingModel.deleteOne({ _id: result.user.weddingId });
  expect(await getCurrentUser()).toBeNull();
});

test("private wedding reads derive scope from the user and keep another wedding isolated", async () => {
  const first = await registerOwner(input, null);
  const second = await registerOwner({ ...input, email: "second@example.com", wedding: { ...input.wedding, brideName: "Ananya" } }, null);
  context.cookie = `mmm_session=${first.session.token}`;
  expect((await getCurrentWedding()).id).toBe(first.user.weddingId);
  context.cookie = `mmm_session=${second.session.token}`;
  expect((await getCurrentWedding()).id).toBe(second.user.weddingId);
  expect((await getCurrentWedding()).brideName).toBe("Ananya");
});

test("atomic durable limits allow exactly the configured number under concurrency", async () => {
  const policy = { scope: "login" as const, key: "concurrent-request", limit: 5, windowSeconds: 900 };
  const results = await Promise.all(Array.from({ length: 20 }, () => rateLimiter.consume(policy)));
  expect(results.filter(result => result.allowed)).toHaveLength(5);
  expect(await RateLimitModel.countDocuments()).toBe(1);
  const record = await RateLimitModel.findOne().lean();
  expect(record?.count).toBe(20);
});

test("HTTP auth journey sets cookies, rejects invalid login and blocks throttled attempts", async () => {
  const response = await register(request("register", input));
  expect(response.status).toBe(201);
  const body = await response.json();
  expect(body.data.role).toBe("OWNER");
  expect(body.data).not.toHaveProperty("passwordHash");
  const cookie = response.headers.get("set-cookie")!.split(";")[0];
  expect(response.headers.get("set-cookie")).toContain("HttpOnly");
  const exited = await logout(request("logout", {}, cookie));
  expect(exited.status).toBe(200);
  expect(await sessionService.read(cookie)).toBeNull();
  for (let i = 0; i < 5; i++) {
    expect((await login(request("login", { email: input.email, password: "incorrect" }))).status).toBe(401);
  }
  const limited = await login(request("login", { email: input.email, password: input.password }));
  expect(limited.status).toBe(429);
  expect(Number(limited.headers.get("retry-after"))).toBeGreaterThan(0);
  expect(await SessionModel.countDocuments()).toBe(0);
});
