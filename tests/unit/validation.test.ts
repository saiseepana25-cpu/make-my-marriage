import { expect, test } from "vitest";
import { pagination, readJson, requireObjectId } from "@/lib/api/validation";
import { parseLoginRequest, parseSignupRequest } from "@/features/auth/requests";

test("credentials normalize email without changing the password", () => {
  expect(parseLoginRequest({ email: " ME@EXAMPLE.COM ", password: " password " }))
    .toEqual({ email: "me@example.com", password: " password " });
  expect(parseSignupRequest({
    name: " Bride ", email: "bride@example.com", password: "test-password", relationshipType: "BRIDE",
    role: "OWNER", weddingId: "browser-controlled",
  })).not.toHaveProperty("role");
});

test("identifiers, pagination and JSON fail on malformed input", async () => {
  expect(() => requireObjectId("bad-id", "eventId")).toThrow();
  expect(pagination(new URLSearchParams())).toEqual({ page: 1, limit: 20, skip: 0 });
  expect(() => pagination(new URLSearchParams("limit=101"))).toThrow();
  expect(() => pagination(new URLSearchParams("page=1.5"))).toThrow();
  await expect(readJson(new Request("http://localhost", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: "[]",
  }))).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
});

