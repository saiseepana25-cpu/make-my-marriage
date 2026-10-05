import type { ApiErrorCode } from "@/types/api";

export class AppError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly status: number,
    public readonly details: string[] = [],
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function unavailable(feature: string): AppError {
  return new AppError("SERVICE_UNAVAILABLE", `${feature} is not configured yet.`, 503);
}
