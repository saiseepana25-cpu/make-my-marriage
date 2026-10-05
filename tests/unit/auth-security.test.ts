// @vitest-environment node
import { expect, test, vi } from "vitest";
import { assertAuthOrigin, authClientIp, readAuthJson } from "@/features/auth/http";
import { parseRegistrationRequest } from "@/features/auth/requests";
import { readSessionToken, sessionCookieName, setSessionCookie } from "@/features/auth/session";
import { rateLimitWindow } from "@/services/rate-limit/rate-limiter";
import { NextResponse } from "next/server";

const account = { name: "Priya", email: " PRIYA@EXAMPLE.COM ", password: "12345678", relationshipType: "BRIDE" };
const wedding = { brideName: "Priya", groomName: "Sai", weddingDate: "2027-02-28", location: "Hyderabad" };

test("registration requires wedding details and never trusts browser ownership or scope", () => {
  const result = parseRegistrationRequest({ ...account, wedding, role: "ADMIN", weddingId: "another-wedding" });
  expect(result.email).toBe("priya@example.com");
  expect(result).not.toHaveProperty("role");
  expect(result).not.toHaveProperty("weddingId");
  expect(() => parseRegistrationRequest(account)).toThrow();
  expect(() => parseRegistrationRequest({ ...account, wedding: { ...wedding, weddingDate: "2027-02-30" } })).toThrow();
});

test("approved password minimum accepts eight characters and rejects seven or bcrypt truncation", () => {
  expect(() => parseRegistrationRequest({ ...account, wedding })).not.toThrow();
  expect(() => parseRegistrationRequest({ ...account, password: "1234567", wedding })).toThrow();
  expect(() => parseRegistrationRequest({ ...account, password: "😀".repeat(8), wedding })).not.toThrow();
  expect(() => parseRegistrationRequest({ ...account, password: "é".repeat(37), wedding })).toThrow();
});

test("auth mutations reject missing, cross-site and spoofed origins", () => {
  vi.stubEnv("NODE_ENV", "development");
  vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  expect(() => assertAuthOrigin(new Request("http://localhost:3000/api"))).toThrow();
  expect(() => assertAuthOrigin(new Request("http://localhost:3000/api", { headers: { origin: "https://attacker.example" } }))).toThrow();
  expect(() => assertAuthOrigin(new Request("http://attacker.example/api", { headers: { origin: "http://attacker.example" } }))).toThrow();
  expect(() => assertAuthOrigin(new Request("http://localhost:3000/api", { headers: { origin: "http://localhost:3000", "sec-fetch-site": "cross-site" } }))).toThrow();
  expect(() => assertAuthOrigin(new Request("http://localhost:3000/api", { headers: { origin: "http://localhost:3000" } }))).not.toThrow();
});

test("trusted-IP policy fails closed outside Vercel and ignores local spoofed forwarding", () => {
  vi.stubEnv("NODE_ENV", "development");
  expect(authClientIp(new Request("http://localhost", { headers: { "x-forwarded-for": "1.2.3.4" } }))).toBe("local-development");
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("VERCEL", "");
  expect(() => authClientIp(new Request("https://example.com"))).toThrow();
  vi.stubEnv("VERCEL", "1");
  expect(authClientIp(new Request("https://example.com", { headers: { "x-vercel-forwarded-for": "1.2.3.4", "x-forwarded-for": "8.8.8.8" } }))).toBe("1.2.3.4");
  expect(() => authClientIp(new Request("https://example.com", { headers: { "x-vercel-forwarded-for": "not-an-ip" } }))).toThrow();
});

test("JSON bounds apply to streamed bodies without Content-Length", async () => {
  const request = (body: string) => new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body });
  await expect(readAuthJson(request(JSON.stringify({ name: "x".repeat(17_000) })))).rejects.toMatchObject({ status: 413 });
  await expect(readAuthJson(request("[]"))).rejects.toMatchObject({ status: 400 });
  await expect(readAuthJson(request("{"))).rejects.toMatchObject({ status: 400 });
  await expect(readAuthJson(request('{"name":"Priya"}'))).resolves.toEqual({ name: "Priya" });
});

test("cookies are opaque, unambiguous and protected in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  const token = "A".repeat(43);
  expect(sessionCookieName()).toBe("__Host-mmm_session");
  expect(readSessionToken(`__Host-mmm_session=${token}`)).toBe(token);
  expect(readSessionToken(`__Host-mmm_session=${token}; __Host-mmm_session=${token}`)).toBeNull();
  expect(readSessionToken("__Host-mmm_session=forged-user-id")).toBeNull();
  const response = NextResponse.json({ success: true });
  setSessionCookie(response, { token, expiresAt: new Date(Date.now() + 2_592_000_000) });
  const cookie = response.headers.get("set-cookie");
  expect(cookie).toContain("HttpOnly"); expect(cookie).toContain("Secure");
  expect(cookie).toContain("SameSite=lax"); expect(cookie).toContain("Max-Age=2592000");
  expect(cookie).not.toContain("Domain=");
  setSessionCookie(response, null);
  expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
});

test("rate-limit identifiers hide personal data and rotate even before TTL cleanup", () => {
  vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "a".repeat(64));
  const policy = { scope: "login" as const, key: "ip:1.2.3.4:priya@example.com", limit: 5, windowSeconds: 60 };
  const first = rateLimitWindow(policy, 119_999);
  const second = rateLimitWindow(policy, 120_000);
  expect(first.key).toMatch(/^[a-f0-9]{64}$/);
  expect(first.key).not.toBe(second.key);
  expect(first.retryAfterSeconds).toBe(1);
  expect(second.retryAfterSeconds).toBe(60);
  vi.stubEnv("AUTH_RATE_LIMIT_SECRET", "");
  expect(() => rateLimitWindow(policy)).toThrow();
});
