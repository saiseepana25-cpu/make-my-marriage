// @vitest-environment node
import { expect, test, vi } from "vitest";
import { sessionService } from "@/features/auth/session";
import { rateLimiter } from "@/services/rate-limit/rate-limiter";
import { DevelopmentEmailService, emailService } from "@/services/email/email-service";
import { requireCronAuthorization } from "@/services/cron/reminders";

test("pending adapters cannot silently enable authentication or abuse-prone endpoints", async () => {
  expect(await sessionService.read("untrusted-cookie")).toBeNull();
  await expect(sessionService.create("user")).rejects.toMatchObject({ status: 503 });
  await expect(rateLimiter.consume({ scope: "login", key: "test", limit: 5, windowSeconds: 60 }))
    .rejects.toMatchObject({ status: 503 });
});

test("development emails explicitly report not sent and production refuses the adapter", async () => {
  vi.stubEnv("NODE_ENV", "development");
  expect(await emailService.sendEmail({ to: "example@example.com", subject: "Test", text: "Test" }))
    .toEqual({ status: "not-sent", reason: "development-adapter" });
  vi.stubEnv("NODE_ENV", "production");
  await expect(new DevelopmentEmailService().sendEmail({
    to: "example@example.com", subject: "Test", text: "Test",
  })).rejects.toMatchObject({ status: 503 });
});

test("cron authorization rejects missing/wrong secrets", () => {
  vi.stubEnv("CRON_SECRET", "test-cron-secret");
  expect(() => requireCronAuthorization(new Request("http://localhost"))).toThrow();
  expect(() => requireCronAuthorization(new Request("http://localhost", {
    headers: { authorization: "Bearer test-cron-secret" },
  }))).not.toThrow();
});
