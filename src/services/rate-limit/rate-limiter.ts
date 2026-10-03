import "server-only";
import { AppError, unavailable } from "@/lib/api/errors";

export type RateLimitScope = "login" | "signup" | "forgot-password" | "rsvp" | "photo-presign" | "email";
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

// No in-memory fallback: a Vercel instance-local counter cannot enforce durable limits.
export const rateLimiter: RateLimiter = {
  async consume() { throw unavailable("Durable rate limiting"); },
};

export async function enforceRateLimit(request: RateLimitRequest, limiter: RateLimiter = rateLimiter) {
  const result = await limiter.consume(request);
  if (!result.allowed) throw new AppError("RATE_LIMITED", "Too many requests. Please try again later.", 429);
  return result;
}

