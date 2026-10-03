// @vitest-environment node
import mongoose from "mongoose";
import { expect, test, vi } from "vitest";
import { ConfigurationError } from "@/config/server-env";
import { AppError } from "@/lib/api/errors";
import { apiError, apiSuccess, handleApi } from "@/lib/api/response";

test.each([
  new mongoose.Error.ValidationError(),
  new mongoose.Error.CastError("ObjectId", "private-submitted-value", "weddingId"),
])("database validation failures return safe 400 responses (%s)", async (error) => {
  error.message = "private-submitted-value";
  const response = apiError(error);
  expect(response.status).toBe(400);
  expect(await response.json()).toEqual({
    success: false, data: null, message: "Validation failed.",
    error: { code: "VALIDATION_ERROR", details: [] },
  });
});

test("duplicate keys return 409 without exposing the conflicting value or index", async () => {
  const response = apiError(new mongoose.mongo.MongoServerError({
    code: 11000, message: "duplicate private@example.com", keyValue: { email: "private@example.com" },
  }));
  expect(response.status).toBe(409);
  expect(await response.json()).toEqual({
    success: false, data: null, message: "A record with these unique fields already exists.",
    error: { code: "CONFLICT", details: [] },
  });
});

test("other database failures remain internal errors", async () => {
  const logger = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = apiError(new mongoose.mongo.MongoServerError({ code: 18, message: "private database URI" }));
  expect(response.status).toBe(500);
  expect(await response.json()).toMatchObject({ error: { code: "INTERNAL_ERROR", details: [] } });
  expect(logger).toHaveBeenCalledWith("API failure", expect.objectContaining({ kind: "MongoError", databaseCode: 18 }));
  expect(JSON.stringify(logger.mock.calls)).not.toContain("private database URI");
});

test("application errors retain their documented status and safe details", async () => {
  const response = apiError(new AppError("FORBIDDEN", "Access denied.", 403, ["Owner required."]));
  expect(response.status).toBe(403);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toMatchObject({
    message: "Access denied.", error: { code: "FORBIDDEN", details: ["Owner required."] },
  });
});

test("missing server configuration returns a generic unavailable response", async () => {
  const logger = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = apiError(new ConfigurationError("MONGODB_URI"));
  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({
    success: false, data: null, message: "This service is not configured yet.",
    error: { code: "SERVICE_UNAVAILABLE", details: [] },
  });
  expect(logger).toHaveBeenCalledWith("API failure", expect.objectContaining({
    kind: "ConfigurationError", configuration: "MONGODB_URI",
  }));
});

test("unexpected errors retain operation context without exposing messages, names or stacks", async () => {
  const logger = vi.spyOn(console, "error").mockImplementation(() => {});
  const error = new TypeError("secret password and mongodb://credentials");
  error.name = "secret password";
  error.stack = "secret stack with credentials";
  const response = await handleApi(() => { throw error; }, "auth.me");
  expect(response.status).toBe(500);
  expect(logger).toHaveBeenCalledWith("API failure", {
    errorId: expect.any(String), operation: "auth.me", kind: "TypeError",
  });
  expect(JSON.stringify(logger.mock.calls)).not.toContain("secret");
  expect(await response.text()).not.toContain("secret");
});

test("handler rejections use the error envelope", async () => {
  const response = await handleApi(async () => { throw new AppError("UNAUTHENTICATED", "Sign in required.", 401); });
  expect(response.status).toBe(401);
  expect(await response.json()).toMatchObject({ success: false, error: { code: "UNAUTHENTICATED" } });
});

test("successful handlers retain their response and envelope", async () => {
  const response = apiSuccess({ id: "record" }, "Created", 201);
  expect(await handleApi(() => response)).toBe(response);
  expect(response.status).toBe(201);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({ success: true, data: { id: "record" }, message: "Created", error: null });
});
