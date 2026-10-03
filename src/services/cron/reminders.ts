import "server-only";
import { timingSafeEqual } from "node:crypto";
import { requiredServerEnv } from "@/config/server-env";
import { AppError } from "@/lib/api/errors";

export interface ReminderJobResult {
  checked: number;
  sent: number;
  failed: number;
}
export interface ReminderService {
  // Future implementation selects due tasks/events and handles durable deduplication.
  processDueReminders(): Promise<ReminderJobResult>;
}

export function requireCronAuthorization(request: Request): void {
  const expected = Buffer.from(`Bearer ${requiredServerEnv("CRON_SECRET")}`);
  const actual = Buffer.from(request.headers.get("authorization") ?? "");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new AppError("UNAUTHENTICATED", "Invalid cron authorization.", 401);
  }
}
// No endpoint/schedule until the POST/GET contract, reminder state and delivery policy are resolved.

