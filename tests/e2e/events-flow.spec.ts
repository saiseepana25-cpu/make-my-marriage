import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";

test.beforeAll(() => {
  if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run event browser tests with playwright.auth.config.ts and its isolated database.");
});
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: { origin: "http://localhost:3100" }, data: {
    name: `Sai ${label}`, email: `events-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM",
    wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" },
  } });
  expect(response.status()).toBe(201);
}
async function fill(page: Page) {
  await page.getByLabel("Event name", { exact: false }).fill("Sangeet Night");
  await page.getByLabel("Event date", { exact: false }).fill("2027-02-28");
  await page.getByLabel("Start time", { exact: false }).fill("20:00");
  await page.getByLabel("End time", { exact: false }).fill("01:00");
  await page.getByLabel("End date", { exact: false }).fill("2027-03-01");
  await page.getByLabel("Venue name", { exact: false }).fill("Family Courtyard");
  await page.getByLabel("Address & landmarks", { exact: false }).fill("Main entrance, Hyderabad");
  await page.getByLabel("Description & notes", { exact: false }).fill("Family performances followed by dinner.");
}

test("desktop event creation, persistence, timeline views, editing and confirmed deletion", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await register(page, "desktop"); await page.goto("/events");
  await expect(page.getByRole("heading", { name: "No wedding events added yet" })).toBeVisible();
  await page.screenshot({ path: "test-results/events-empty-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "Add your first event" }).click();
  await fill(page);
  await page.screenshot({ path: "test-results/events-add-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page).toHaveURL(/\/events\/[a-f\d]{24}\?saved=created$/);
  await expect(page.getByRole("heading", { name: "Sangeet Night", exact: true })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("1 Mar");
  const id = new URL(page.url()).pathname.split("/").pop()!;
  const client = new MongoClient(process.env.MMM_AUTH_TEST_URI!);
  try {
    const stored = await client.db("mmm-test-browser").collection("events").findOne({ _id: new ObjectId(id) });
    expect(stored?.startAt.toISOString()).toBe("2027-02-28T14:30:00.000Z");
    expect(stored?.endAt.toISOString()).toBe("2027-02-28T19:30:00.000Z");
  } finally { await client.close(); }
  await page.screenshot({ path: "test-results/events-details-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "Edit event", exact: true }).click();
  await expect(page.getByLabel(/End date/)).toHaveValue("2027-03-01");
  await page.getByLabel(/Event name/).fill("Sangeet & Dinner");
  await page.getByLabel(/End time/).fill(""); await page.getByLabel(/End date/).fill("");
  await page.screenshot({ path: "test-results/events-edit-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: "Sangeet & Dinner", exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByRole("heading", { name: "Sangeet & Dinner", exact: true })).toBeVisible();
  await page.request.post("/api/v1/events", { headers: { origin: "http://localhost:3100" }, data: { name: "Haldi", venue: "Family lawn", startAt: "2027-02-27T10:00:00+05:30" } });
  await page.request.post("/api/v1/events", { headers: { origin: "http://localhost:3100" }, data: { name: "Engagement", venue: "Home", startAt: "2020-02-27T10:00:00+05:30" } });
  await page.getByRole("link", { name: "Back to events", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
  expect(await page.getByRole("article").getByRole("heading").allTextContents()).toEqual(["Haldi", "Sangeet & Dinner"]);
  await page.screenshot({ path: "test-results/events-overview-desktop.png", fullPage: true });
  await page.getByRole("link", { name: "Past Events (1)" }).click();
  await expect(page.getByRole("heading", { name: "Engagement", exact: true })).toBeVisible();
  await page.goto(`/events/${id}`);
  await page.getByRole("button", { name: "Delete event", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this event?" });
  await expect(dialog).toBeVisible(); await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused();
  await page.screenshot({ path: "test-results/events-delete-desktop.png", fullPage: true });
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  expect((await page.request.get(`/api/v1/events/${id}`)).status()).toBe(200);
  await page.getByRole("button", { name: "Delete event", exact: true }).click();
  await dialog.getByRole("button", { name: "Delete event permanently" }).click();
  await expect(page).toHaveURL(/\/events\?deleted=1$/);
  await expect(page.getByRole("status")).toContainText("Event deleted");
  expect((await page.request.get(`/api/v1/events/${id}`)).status()).toBe(404);
});

test("mobile event form validates, preserves failed saves, retries and fits small screens", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await register(page, "mobile"); await page.goto("/events");
  await expect(page.getByRole("heading", { name: "No wedding events added yet" })).toBeVisible();
  await page.screenshot({ path: "test-results/events-empty-mobile.png", fullPage: true });
  await page.getByRole("button", { name: "Open workspace menu" }).click();
  await expect(page.getByRole("navigation", { name: "Wedding workspace" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("navigation", { name: "Wedding workspace" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open workspace menu" })).toBeFocused();
  await page.getByRole("button", { name: "Open workspace menu" }).click();
  await page.getByRole("navigation", { name: "Wedding workspace" }).getByRole("link", { name: "Events", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Wedding workspace" })).toBeHidden();
  await page.getByRole("link", { name: "Add your first event" }).click();
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page.getByLabel(/Event name/)).toBeFocused();
  await fill(page); await page.getByLabel(/End date/).fill("");
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page.getByText(/For overnight events/)).toBeVisible();
  await page.getByLabel(/End date/).fill("2027-03-01");
  await page.route("**/api/v1/events", async route => {
    if (route.request().method() === "POST") await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, data: null, message: "Could not save. Please try again.", error: { code: "SERVICE_UNAVAILABLE", details: [] } }) });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Could not save");
  await expect(page.getByLabel(/Venue name/)).toHaveValue("Family Courtyard");
  await page.screenshot({ path: "test-results/events-add-mobile.png", fullPage: true });
  await page.unroute("**/api/v1/events");
  await page.getByRole("button", { name: "Create event", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sangeet Night", exact: true })).toBeVisible();
  await page.screenshot({ path: "test-results/events-details-mobile.png", fullPage: true });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `detail overflow at ${width}`).toBe(false);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Edit event", exact: true }).click();
  await expect(page.getByLabel(/Event name/)).toHaveValue("Sangeet Night");
  await page.screenshot({ path: "test-results/events-edit-mobile.png", fullPage: true });
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `form overflow at ${width}`).toBe(false);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Delete event", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Delete this event?" })).toBeVisible();
  await page.screenshot({ path: "test-results/events-delete-mobile.png", fullPage: true });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.getByRole("link", { name: "Back to events", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.screenshot({ path: "test-results/events-overview-mobile.png", fullPage: true });
  expect(errors).toEqual([]);
});
