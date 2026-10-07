import { expect, test } from "vitest";
import { completionPercentage, weddingCountdown } from "@/features/dashboard/format";

test("countdown uses the saved calendar date and India day boundaries", () => {
  const wedding = "2026-12-12T00:00:00.000Z";
  expect(weddingCountdown(wedding, Date.parse("2026-10-07T10:00:00Z"))).toBe("66 days to go");
  expect(weddingCountdown(wedding, Date.parse("2026-12-11T18:29:59Z"))).toBe("1 day to go");
  expect(weddingCountdown(wedding, Date.parse("2026-12-11T18:30:00Z"))).toBe("Today is your wedding day");
  expect(weddingCountdown(wedding, Date.parse("2026-12-12T18:30:00Z"))).toBe("Our wedding");
  expect(weddingCountdown("2028-03-01T00:00:00Z", Date.parse("2028-02-28T19:00:00Z"))).toBe("1 day to go");
});
test("completion is rounded from global counts and empty progress stays unfilled", () => {
  expect(completionPercentage(14, 22)).toBe(64);
  expect(completionPercentage(0, 0)).toBe(0);
  expect(completionPercentage(22, 22)).toBe(100);
});
