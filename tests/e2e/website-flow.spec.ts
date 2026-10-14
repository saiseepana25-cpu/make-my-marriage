import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";
const origin = { origin: "http://localhost:3100" };
test.beforeAll(() => { if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run Website browser tests using the isolated auth configuration."); });
async function database() {
  const uri = process.env.MMM_AUTH_TEST_URI!;
  if (!uri?.startsWith("mongodb://127.0.0.1:")) throw new Error("Refusing unexpected browser test database.");
  return new MongoClient(uri);
}
test.beforeEach(async () => { const client = await database(); try { await client.db("mmm-test-browser").collection("rate_limits").deleteMany({}); } finally { await client.close(); } });
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: origin, data: { name: "Sai", email: `website-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } } });
  expect(response.status()).toBe(201);
  const user = (await response.json()).data;
  const wedding = (await (await page.request.get("/api/v1/weddings/current")).json()).data;
  return { user, wedding };
}
async function capture(page: Page, name: string, width = 1440) {
  await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow in ${name}`).toBe(false);
  await page.screenshot({ path: `test-results/website-${name}.png`, fullPage: true });
}

test("private saved summary, sharing, and anonymous public schedule reflect real updates", async ({ page, browser }) => {
  const errors: string[] = []; page.on("pageerror", e => errors.push(e.message));
  const { wedding } = await register(page, "saved");
  for (const [name, time] of [["Reception", "2027-03-01T01:30:00+05:30"], ["Mehendi", "2027-02-27T18:00:00+05:30"], ["Haldi", "2027-02-28T08:30:00+05:30"], ["Wedding", "2027-02-28T19:15:00+05:30"]]) {
    const response = await page.request.post("/api/v1/events", { headers: origin, data: { name, startAt: time, endAt: name === "Wedding" ? "2027-03-01T01:00:00+05:30" : undefined, venue: `${name} Hall`, location: "Hyderabad & Gardens", description: name === "Wedding" ? "స్వాగతం to our celebration" : undefined, livestreamUrl: name === "Wedding" ? "https://example.com/watch" : undefined } }); expect(response.status()).toBe(201);
  }
  await page.goto("/wedding-website"); const url = `http://localhost:3100/wedding/${wedding.websiteSlug}`;
  await expect(page.getByLabel("Guest website URL")).toHaveText(url); await expect(page.getByText("4 ceremonies configured")).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit wedding details", exact: true })).toHaveAttribute("href", "/settings"); await capture(page, "workspace");
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], { origin: "http://localhost:3100" });
  await page.getByRole("button", { name: "Copy link" }).click(); await expect(page.getByRole("main").getByRole("status")).toHaveText("Link copied successfully."); expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);
  const [opened] = await Promise.all([page.waitForEvent("popup"), page.getByRole("link", { name: /Open wedding website/ }).click()]); await expect(opened).toHaveURL(url); await opened.close();
  const context = await browser.newContext(); const guest = await context.newPage();
  try {
    await guest.goto(url); await expect(guest.getByRole("heading", { level: 1 })).toHaveText("Sai & Adya");
    await expect(guest.getByRole("heading", { name: "Mehendi", exact: true })).toBeVisible(); await expect(guest.getByRole("heading", { name: "Reception", exact: true })).toHaveCount(0);
    await expect(guest.getByRole("main")).toContainText("Sunday, 28 February 2027"); await expect(guest.getByRole("main")).toContainText("Monday, 1 March 2027");
    await expect(guest.getByRole("link", { name: /Watch livestream/ })).toHaveAttribute("href", "https://example.com/watch");
    expect(await guest.locator("main img, main iframe").count()).toBe(0); expect((await guest.request.get("/api/v1/auth/me")).status()).toBe(401);
    expect((await guest.request.get("/api/v1/guests")).status()).toBe(401); await capture(guest, "guest");
    await guest.route("**/api/v1/public/weddings/*/events?**", route => route.abort());
    await guest.getByRole("button", { name: "Load more celebrations" }).click(); await expect(guest.getByRole("heading", { name: "Couldn’t load more celebrations" })).toBeVisible();
    await expect(guest.getByRole("heading", { name: "Mehendi", exact: true })).toBeVisible(); await capture(guest, "pagination-error-mobile", 390);
    await guest.unroute("**/api/v1/public/weddings/*/events?**"); await guest.getByRole("button", { name: "Retry celebrations" }).click(); await expect(guest.getByRole("heading", { name: "Reception", exact: true })).toBeVisible();
    for (const width of [320, 390, 768, 1024, 1440]) { await guest.setViewportSize({ width, height: 1000 }); expect(await guest.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false); }
    await capture(guest, "guest-mobile", 320);
    await page.request.put("/api/v1/weddings/current", { headers: origin, data: { groomName: "Sai Kumar", weddingDate: "2020-02-29", location: "విజయవాడ" } });
    await guest.reload(); await expect(guest.getByRole("heading", { level: 1 })).toHaveText("Sai Kumar & Adya"); await expect(guest.getByText("Celebrating our wedding memories")).toBeVisible();
    await expect(guest.getByRole("heading", { name: "Haldi", exact: true })).toBeVisible(); expect((await (await page.request.get("/api/v1/weddings/current")).json()).data.websiteSlug).toBe(wedding.websiteSlug);
    expect(errors).toEqual([]);
  } finally { await context.close(); }
});

test("private loading, copy fallback, retry, session expiry and family sharing", async ({ page }) => {
  const { user } = await register(page, "states");
  await page.addInitScript(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("Permission denied")) } }));
  let release!: () => void; const gate = new Promise<void>(done => { release = done; });
  await page.route("**/api/v1/weddings/current", async route => { await gate; await route.abort(); });
  await page.goto("/wedding-website"); await expect(page.getByRole("status", { name: "Loading wedding website" })).toBeVisible(); await capture(page, "loading"); release();
  await expect(page.getByRole("heading", { name: "Couldn’t load wedding website" })).toBeVisible(); await page.unroute("**/api/v1/weddings/current"); await page.getByRole("button", { name: "Retry", exact: true }).click();
  await expect(page.getByRole("heading", { name: "No celebrations yet" })).toBeVisible(); await expect(page.getByRole("link", { name: "Add event", exact: true })).toHaveAttribute("href", "/events/new");
  await page.getByRole("button", { name: "Copy link" }).click(); const manual = page.getByLabel("Link to copy manually"); await expect(manual).toBeVisible(); await expect(manual).toHaveAttribute("readonly", ""); await capture(page, "copy-failure-mobile", 320);
  await page.route("**/api/v1/events?limit=3", route => route.abort()); await page.reload(); await expect(page.getByRole("heading", { name: "Couldn’t load celebrations" })).toBeVisible(); await expect(page.getByRole("button", { name: "Copy link" })).toBeEnabled(); await page.unroute("**/api/v1/events?limit=3"); await page.getByRole("button", { name: "Retry celebrations" }).click(); await expect(page.getByRole("heading", { name: "No celebrations yet" })).toBeVisible();
  for (const [status, heading] of [[401, "Session expired"], [404, "Wedding workspace unavailable"]] as const) {
    await page.route("**/api/v1/weddings/current", route => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: false }) })); await page.reload(); await expect(page.getByRole("heading", { name: heading })).toBeVisible(); await page.unroute("**/api/v1/weddings/current");
  }
  const client = await database(); try { await client.db("mmm-test-browser").collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "FAMILY_MEMBER" } }); } finally { await client.close(); }
  await page.reload(); await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible(); await expect(page.getByRole("link", { name: "Edit wedding details", exact: true })).toHaveCount(0); await expect(page.getByRole("link", { name: "Manage events", exact: true })).toHaveCount(0); await expect(page.getByRole("link", { name: "Add event", exact: true })).toHaveCount(0); await capture(page, "family-mobile", 390);
});

test("empty public website, long saved values, today countdown and missing links", async ({ page, browser }) => {
  const { wedding } = await register(page, "empty");
  const today = new Date(Date.now() + 330 * 60000).toISOString().slice(0, 10);
  expect((await page.request.put("/api/v1/weddings/current", { headers: origin, data: { groomName: "G".repeat(100), brideName: "B".repeat(100), location: "L".repeat(200), weddingDate: today } })).status()).toBe(200);
  await page.goto("/wedding-website"); await expect(page.getByRole("heading", { name: "No celebrations yet" })).toBeVisible();
  for (const width of [320, 390, 768, 1440]) { await page.setViewportSize({ width, height: 1000 }); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false); }
  await capture(page, "long-workspace-mobile", 320);
  const context = await browser.newContext(); const guest = await context.newPage();
  try {
    await guest.goto(`/wedding/${wedding.websiteSlug}`); await expect(guest.getByRole("heading", { name: "Celebrations are being planned" })).toBeVisible(); await expect(guest.getByText("Today is the wedding day")).toBeVisible();
    await expect(guest.getByRole("link", { name: /Open in Maps/ })).toHaveCount(0); await expect(guest.getByRole("link", { name: /Watch livestream/ })).toHaveCount(0); await capture(guest, "empty-long-mobile", 320);
    // Next returns 200 when a notFound result arrives after the loading shell streams.
    // The public API must still return an actual 404 and the page must show the unavailable UI.
    expect((await guest.request.get("/api/v1/public/weddings/does-not-exist")).status()).toBe(404);
    await guest.goto("/wedding/does-not-exist"); await expect(guest.getByRole("heading", { name: "Wedding website unavailable" })).toBeVisible(); await capture(guest, "unavailable", 1440);
    await guest.goto("/wedding-website"); await expect(guest).toHaveURL(/\/login$/);
  } finally { await context.close(); }
});
