import { expect, test } from "@playwright/test";

test("marketing page links to login", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Make My Marriage", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Log in", exact: true })).toBeVisible();
});

test("private workspace denies anonymous visitors", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login$/);
});

test("public wedding placeholder is accessible without login", async ({ page }) => {
  await page.goto("/wedding/sai-priya");
  await expect(page.getByRole("heading", { name: "Wedding website", exact: true })).toBeVisible();
});

test("health and current-user endpoints have stable envelopes", async ({ request }) => {
  const health = await request.get("/api/v1/health");
  expect(health.status()).toBe(200);
  expect(await health.json()).toMatchObject({ success: true, data: { status: "ok" }, error: null });
  const current = await request.get("/api/v1/auth/me");
  expect(current.status()).toBe(401);
  expect(await current.json()).toMatchObject({ success: false, data: null, error: { code: "UNAUTHENTICATED" } });
});

