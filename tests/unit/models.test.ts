// @vitest-environment node
import { Types } from "mongoose";
import { expect, test } from "vitest";
import { ActivityModel, ExpenseModel, GuestModel, PhotoModel, TaskModel, UserModel } from "@/models";

const weddingId = new Types.ObjectId();
const createdBy = new Types.ObjectId();

test("wedding-wide tasks need no event and reject undocumented statuses", async () => {
  const task = new TaskModel({ weddingId, createdBy, title: "Book venue", priority: "HIGH", status: "TODO" });
  await expect(task.validate()).resolves.toBeUndefined();
  task.set("status", "DONE");
  await expect(task.validate()).rejects.toMatchObject({ name: "ValidationError" });
});

test("user schema normalizes email and hides password hashes", async () => {
  const user = new UserModel({
    weddingId, name: "Bride", email: " BRIDE@EXAMPLE.COM ", passwordHash: "hash",
    role: "OWNER", relationshipType: "BRIDE",
  });
  expect(user.email).toBe("bride@example.com");
  await expect(user.validate()).resolves.toBeUndefined();
  expect(UserModel.schema.path("passwordHash").options.select).toBe(false);
});

test("user schema requires wedding membership with all other fields valid", async () => {
  const user = new UserModel({
    name: "Bride", email: "bride@example.com", passwordHash: "hash",
    role: "OWNER", relationshipType: "BRIDE",
  });
  await expect(user.validate()).rejects.toMatchObject({
    name: "ValidationError", errors: { weddingId: { kind: "required" } },
  });
});

test("user schema excludes guest accounts with wedding membership present", async () => {
  const user = new UserModel({
    weddingId, name: "Bride", email: "bride@example.com", passwordHash: "hash",
    role: "GUEST", relationshipType: "BRIDE",
  });
  await expect(user.validate()).rejects.toMatchObject({
    name: "ValidationError", errors: { role: { kind: "enum" } },
  });
});

test("expenses reject negative and overpaid values", async () => {
  const expense = new ExpenseModel({
    weddingId, createdBy, name: "Venue", category: "Venue", amount: 100, paidAmount: 101, paymentStatus: "PAID",
  });
  await expect(expense.validate()).rejects.toMatchObject({ name: "ValidationError" });
  expense.set({ amount: -1, paidAmount: 0 });
  await expect(expense.validate()).rejects.toMatchObject({ name: "ValidationError" });
});

test("individual guests reject negative attendance", async () => {
  const guest = new GuestModel({ weddingId, name: "Guest", rsvpStatus: "ATTENDING", numberAttending: -1 });
  await expect(guest.validate()).rejects.toMatchObject({ name: "ValidationError" });
});

test("photo/activity records have createdAt only and activities use relatedEventId", () => {
  expect(PhotoModel.schema.path("createdAt")).toBeDefined();
  expect(PhotoModel.schema.path("updatedAt")).toBeUndefined();
  expect(ActivityModel.schema.path("updatedAt")).toBeUndefined();
  expect(ActivityModel.schema.path("relatedEventId")).toBeDefined();
  expect(ActivityModel.schema.path("eventId")).toBeUndefined();
});
