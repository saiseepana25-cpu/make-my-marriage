import { expect, test } from "@playwright/test";

test("homepage has working signup, login and section navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Plan your wedding\.\s*Together with your family\./);
  await page.getByRole("link", { name: "See How It Works", exact: true }).click();
  await expect(page).toHaveURL(/#how-it-works$/);
  await expect(page.getByRole("heading", { name: "Simple from the first step.", exact: true })).toBeInViewport();
  await page.getByRole("link", { name: "Start Planning Now", exact: true }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole("heading", { name: "Create an account", exact: true })).toBeVisible();
  await page.goto("/");
  await page.getByRole("link", { name: "Login", exact: true }).first().click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Log in", exact: true })).toBeVisible();
});

test("FAQ opens with the keyboard and closes the previous answer", async ({ page }) => {
  await page.goto("/#faq");
  const questions = page.locator("#faq summary");
  const answers = page.locator("#faq details > div");
  await questions.nth(0).focus();
  await page.keyboard.press("Enter");
  await expect(answers.nth(0)).toBeVisible();
  await questions.nth(1).click();
  await expect(answers.nth(0)).toBeHidden();
  await expect(answers.nth(1)).toBeVisible();
});

test("mobile navigation closes on selection and Escape", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open menu", exact: true });
  await toggle.click();
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Guest Experience", exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/#guest-experience$/);
  await toggle.click();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
  expect(pageErrors).toEqual([]);
});

test("homepage fits small screens and serves all of its images", async ({ page }) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `horizontal overflow at ${width}px`).toBe(false);
  }
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
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
