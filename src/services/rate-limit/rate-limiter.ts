import "server-only";
import { AppError, unavailable } from "@/lib/api/errors";
import { createHmac } from "node:crypto";
import { requiredServerEnv } from "@/config/server-env";
import { RateLimitModel } from "@/models/rate-limit";
import { ensureAuthIndexes } from "@/features/auth/indexes";

export type RateLimitScope = "login" | "signup" | "forgot-password" | "rsvp" | "photo-presign" | "email" | "events";
export interface RateLimitRequest {
  scope: RateLimitScope;
  // Adapter should hash identifiers before persistence; never store credentials.
  key: string;
  limit: number;
  windowSeconds: number;
}
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}
export interface RateLimiter {
  consume(request: RateLimitRequest): Promise<RateLimitResult>;
}

export function rateLimitWindow(request: RateLimitRequest, now = Date.now()) {
  if (!Number.isSafeInteger(request.limit) || request.limit < 1
    || !Number.isSafeInteger(request.windowSeconds) || request.windowSeconds < 1) {
    throw new RangeError("Invalid rate limit policy.");
  }
  const secret = requiredServerEnv("AUTH_RATE_LIMIT_SECRET");
  if (secret.length < 32) throw unavailable("Rate limit secret");
  const duration = request.windowSeconds * 1000;
  const start = Math.floor(now / duration) * duration;
  const key = createHmac("sha256", secret).update(JSON.stringify([request.scope, request.key, start])).digest("hex");
  return { key, expiresAt: new Date(start + duration), retryAfterSeconds: Math.max(1, Math.ceil((start + duration - now) / 1000)) };
}

// Durable atomic counters; never fall back to instance-local state.
export const rateLimiter: RateLimiter = {
  async consume(request) {
    const window = rateLimitWindow(request);
    await ensureAuthIndexes();
    let record;
    try {
      record = await RateLimitModel.findOneAndUpdate({ _id: window.key }, {
        $inc: { count: 1 }, $setOnInsert: { expiresAt: window.expiresAt },
      }, { upsert: true, returnDocument: "after" }).lean();
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== 11000) throw error;
      // Another instance created the same window before this upsert completed.
      record = await RateLimitModel.findOneAndUpdate({ _id: window.key }, { $inc: { count: 1 } }, { returnDocument: "after" }).lean();
    }
    if (!record) throw unavailable("Durable rate limiting");
    return {
      allowed: record.count <= request.limit,
      remaining: Math.max(0, request.limit - record.count),
      retryAfterSeconds: window.retryAfterSeconds,
    };
  },
};

export async function enforceRateLimit(request: RateLimitRequest, limiter: RateLimiter = rateLimiter) {
  const result = await limiter.consume(request);
  if (!result.allowed) throw new AppError("RATE_LIMITED", "Too many requests. Please try again later.", 429, [], result.retryAfterSeconds);
  return result;
}
