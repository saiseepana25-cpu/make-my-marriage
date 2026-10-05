import "server-only";
import { isIP } from "node:net";
import { AppError, unavailable } from "@/lib/api/errors";
import { isRecord, validationError } from "@/lib/api/validation";
import { enforceRateLimit } from "@/services/rate-limit/rate-limiter";

export function assertAuthOrigin(request: Request): void {
  let expected: URL;
  try { expected = new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"); }
  catch { throw unavailable("Application origin"); }
  if (process.env.NODE_ENV === "production" && expected.protocol !== "https:") {
    throw unavailable("HTTPS application origin");
  }
  if (request.headers.get("origin") !== expected.origin || request.headers.get("sec-fetch-site") === "cross-site") {
    throw new AppError("FORBIDDEN", "Please submit this form from Make My Marriage.", 403);
  }
}

export function authClientIp(request: Request): string {
  if (process.env.NODE_ENV !== "production") return "local-development";
  if (process.env.VERCEL !== "1") throw unavailable("Trusted client IP adapter");
  const ip = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (!ip || !isIP(ip)) throw unavailable("Trusted client IP");
  return ip;
}

export async function limitAuthIp(request: Request, scope: "login" | "signup"): Promise<string> {
  const ip = authClientIp(request);
  await enforceRateLimit({
    scope, key: `ip:${ip}`, limit: scope === "login" ? 50 : 5,
    windowSeconds: scope === "login" ? 900 : 3600,
  });
  return ip;
}

export async function readAuthJson(request: Request, maximum = 16 * 1024): Promise<Record<string, unknown>> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    validationError("Content-Type must be application/json.");
  }
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maximum)) {
    throw new AppError("VALIDATION_ERROR", "This form is too large.", 413);
  }
  if (!request.body) validationError("Request body must be valid JSON.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) {
        await reader.cancel();
        throw new AppError("VALIDATION_ERROR", "This form is too large.", 413);
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  let body: unknown;
  try { body = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { validationError("Request body must be valid JSON."); }
  if (!isRecord(body)) validationError("Request body must be a JSON object.");
  return body;
}
