import { AppError } from "@/lib/api/errors";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validationError(message: string): never {
  throw new AppError("VALIDATION_ERROR", "Validation failed", 400, [message]);
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    validationError("Content-Type must be application/json.");
  }
  let body: unknown;
  try { body = await request.json(); } catch { validationError("Request body must be valid JSON."); }
  if (!isRecord(body)) validationError("Request body must be a JSON object.");
  return body;
}

export function requireObjectId(value: unknown, field: string): string {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    validationError(`${field} must be a valid ObjectId.`);
  }
  return value;
}

export function pagination(search: URLSearchParams) {
  const integer = (key: string, fallback: number, maximum: number) => {
    const raw = search.get(key);
    if (raw === null) return fallback;
    if (!/^[1-9]\d*$/.test(raw)) validationError(`${key} must be a positive integer.`);
    const value = Number(raw);
    if (!Number.isSafeInteger(value) || value > maximum) validationError(`${key} exceeds its maximum.`);
    return value;
  };
  const page = integer("page", 1, 1_000_000);
  const limit = integer("limit", 20, 100);
  return { page, limit, skip: (page - 1) * limit };
}

