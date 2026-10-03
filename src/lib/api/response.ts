import "server-only";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ConfigurationError } from "@/config/server-env";
import { AppError } from "@/lib/api/errors";
import type { ApiResponse } from "@/types/api";

export function apiSuccess<T>(data: T, message = "Operation completed successfully", status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, message, error: null },
    { status, headers: { "Cache-Control": "no-store" } },
  );
}

// Operation labels must be developer-defined constants, never request data.
export function apiError(error: unknown, operation = "unspecified") {
  let known: AppError;
  if (error instanceof AppError) {
    known = error;
  } else if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    // Driver messages can contain submitted values; expose only the stable API contract.
    known = new AppError("VALIDATION_ERROR", "Validation failed.", 400);
  } else if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    known = new AppError("CONFLICT", "A record with these unique fields already exists.", 409);
  } else {
    const errorId = randomUUID();
    // Log only diagnostic metadata; messages, stacks and driver payloads may contain secrets.
    console.error("API failure", {
      errorId,
      operation: /^[a-z][a-z0-9.]{0,63}$/.test(operation) ? operation : "unspecified",
      kind: error instanceof ConfigurationError ? "ConfigurationError"
        : error instanceof mongoose.mongo.MongoError ? "MongoError"
        : error instanceof TypeError ? "TypeError"
        : error instanceof RangeError ? "RangeError"
        : error instanceof Error ? "Error" : "UnknownError",
      ...(error instanceof ConfigurationError ? { configuration: error.variable } : {}),
      ...(error instanceof mongoose.mongo.MongoError && Number.isSafeInteger(error.code)
        ? { databaseCode: error.code } : {}),
    });
    known = error instanceof ConfigurationError
      ? new AppError("SERVICE_UNAVAILABLE", "This service is not configured yet.", 503)
      : new AppError("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
  }
  return NextResponse.json<ApiResponse<never>>({
    success: false, data: null, message: known.message,
    error: { code: known.code, details: known.details },
  }, { status: known.status, headers: { "Cache-Control": "no-store" } });
}

export async function handleApi(handler: () => Promise<Response> | Response, operation = "unspecified"): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    return apiError(error, operation);
  }
}
