import { expect, test } from "@playwright/test";
import { MongoClient } from "mongodb";
import { createHash } from "node:crypto";

test.beforeAll(() => {
  if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run full auth tests with playwright.auth.config.ts.");
});

test("signup, saved wedding, persistence, logout and login work end to end", async ({ page, context }) => {
  const email = `desktop-${Date.now()}@example.com`;
  await page.goto("/signup");
  await expect(page.getByRole("button", { name: /Continue to wedding details/ })).toBeEnabled();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "test-results/auth-signup-desktop.png", fullPage: true });
  await page.getByLabel("Your full name").fill("Priya Desktop");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("12345678");
  await page.getByLabel("Confirm password").fill("12345678");
  await page.getByLabel("Your relationship to the couple").selectOption("BRIDE");
  await page.getByRole("button", { name: /Continue to wedding details/ }).click();
  await expect(page.getByLabel("Groom’s name")).toBeFocused();
  await page.getByLabel("Bride’s name").fill("Priya Desktop");
  await page.getByLabel("Groom’s name").fill("Sai Desktop");
  await page.getByLabel("Wedding date").fill("2027-02-28");
  await page.getByLabel("Wedding location").fill("Hyderabad");
  await page.screenshot({ path: "test-results/auth-wedding-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Create my wedding workspace" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Sai Desktop & Priya Desktop" })).toBeVisible();
  await expect(page.getByText("28 February 2027", { exact: true })).toBeVisible();
  const cookie = (await context.cookies()).find(cookie => cookie.name === "mmm_session")!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe("Lax");
  expect(cookie.expires - Date.now() / 1000).toBeGreaterThan(29 * 86400);
  const current = await page.request.get("/api/v1/auth/me");
  expect(current.status()).toBe(200);
  expect((await current.json()).data).not.toHaveProperty("passwordHash");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.screenshot({ path: "test-results/auth-login-desktop.png", fullPage: true });
  expect((await page.request.get("/api/v1/auth/me")).status()).toBe(401);
  const replay = await page.request.get("/api/v1/auth/me", { headers: { cookie: `mmm_session=${cookie.value}` } });
  expect(replay.status()).toBe(401);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("incorrect");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveText("Email or password is incorrect.");
  await page.getByLabel("Password", { exact: true }).fill("12345678");
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  const wedding = await page.request.get("/api/v1/weddings/current?weddingId=000000000000000000000000");
  expect((await wedding.json()).data.brideName).toBe("Priya Desktop");
});

test("mobile signup preserves inputs and expired sessions cannot reopen the workspace", async ({ page, context }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/signup");
  await page.getByLabel("Your full name").fill("Priya Mobile");
  await page.getByLabel("Email address").fill(`mobile-${Date.now()}@example.com`);
  await page.getByLabel("Password", { exact: true }).fill("1234567");
  await page.getByLabel("Confirm password").fill("1234567");
  await page.getByLabel("Your relationship to the couple").selectOption("BRIDE");
  await page.getByRole("button", { name: /Continue to wedding details/ }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("at least 8 characters");
  await page.getByLabel("Password", { exact: true }).fill("12345678");
  await page.getByLabel("Confirm password").fill("12345678");
  await page.getByRole("button", { name: /Continue to wedding details/ }).click();
  await page.getByLabel("Bride’s name").fill("Priya Mobile");
  await page.getByRole("button", { name: /Back to account details/ }).click();
  await expect(page.getByLabel("Your full name")).toHaveValue("Priya Mobile");
  await page.getByRole("button", { name: /Continue to wedding details/ }).click();
  await expect(page.getByLabel("Bride’s name")).toHaveValue("Priya Mobile");
  await page.getByLabel("Groom’s name").fill("Sai Mobile");
  await page.getByLabel("Wedding date").fill("2027-03-01");
  await page.getByLabel("Wedding location").fill("Bengaluru");
  await page.screenshot({ path: "test-results/auth-wedding-mobile.png", fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.getByRole("button", { name: "Create my wedding workspace" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.screenshot({ path: "test-results/auth-dashboard-mobile.png", fullPage: true });
  const cookie = (await context.cookies()).find(cookie => cookie.name === "mmm_session")!;
  const uri = process.env.MMM_AUTH_TEST_URI!;
  if (!uri.startsWith("mongodb://127.0.0.1:")) throw new Error("Refusing unexpected browser test database.");
  const client = new MongoClient(uri);
  try {
    await client.connect();
    await client.db("mmm-test-browser").collection("sessions").updateOne({
      tokenHash: createHash("sha256").update(cookie.value).digest("hex"),
    }, { $set: { expiresAt: new Date(Date.now() - 1000) } });
  } finally { await client.close(); }
  expect((await page.request.get("/api/v1/auth/me")).status()).toBe(401);
  await page.reload();
  await expect(page).toHaveURL(/\/login$/);
});
