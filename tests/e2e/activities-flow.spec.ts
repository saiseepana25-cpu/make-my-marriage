import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";
const origin = { origin: "http://localhost:3100" };
test.beforeAll(() => { if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run Activities browser tests using the isolated auth configuration."); });
test.beforeEach(async () => {
  const uri = process.env.MMM_AUTH_TEST_URI!;
  if (!uri.startsWith("mongodb://127.0.0.1:")) throw new Error("Refusing unexpected browser test database.");
  const client = new MongoClient(uri);
  try { await client.db("mmm-test-browser").collection("rate_limits").deleteMany({}); } finally { await client.close(); }
});
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: origin, data: { name: "Sai", email: `activities-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } } });
  expect(response.status()).toBe(201); return (await response.json()).data;
}
async function createEvent(page: Page) {
  const response = await page.request.post("/api/v1/events", { headers: origin, data: { name: "Haldi ceremony", venue: "Family Hall", startAt: "2099-02-28T10:00:00+05:30" } });
  expect(response.status()).toBe(201); return (await response.json()).data;
}
async function record(page: Page, id: string) { const response = await page.request.get(`/api/v1/activities/${id}`); expect(response.ok()).toBe(true); return (await response.json()).data; }
async function capture(page: Page, name: string, width = 1440) {
  await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow in ${name}`).toBe(false);
  await page.screenshot({ path: `test-results/activities-${name}.png`, fullPage: true });
}
async function widths(page: Page) {
  for (const width of [320, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow at ${width}`).toBe(false); }
}
test("manual lifecycle, original chronology, retained updates after event deletion and timeline filters/pagination", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await register(page, "lifecycle"); await page.goto("/activities"); await expect(page.getByRole("heading", { name: "No activity yet" })).toBeVisible(); await capture(page, "empty");
  await page.getByRole("link", { name: "Add update", exact: true }).click();
  await page.getByLabel(/^Title/).fill("Wedding outfits [QA]"); await page.getByLabel(/^Description/).fill("శుభం — collected and ready"); await page.getByRole("textbox", { name: /^Category/ }).fill("Wardrobe"); await capture(page, "add");
  await page.getByRole("button", { name: "Save update", exact: true }).click(); await expect(page).toHaveURL(/\/activities\/[a-f0-9]{24}\?saved=created$/);
  const id = new URL(page.url()).pathname.split("/").pop()!, original = await record(page, id);
  await page.reload(); await expect(page.getByRole("heading", { name: "Wedding outfits [QA]", exact: true })).toBeVisible(); await capture(page, "manual-details");
  const event = await createEvent(page);
  await page.getByRole("link", { name: "Edit update", exact: true }).click(); await expect(page.getByLabel(/^Description/)).toHaveValue("శుభం — collected and ready"); await page.getByLabel(/^Related event/).selectOption(event.id); await page.getByLabel(/^Title/).fill("Wedding outfits confirmed"); await capture(page, "edit");
  await page.getByRole("button", { name: "Save changes" }).click(); await expect(page).toHaveURL(/saved=updated$/); expect((await record(page, id)).createdAt).toBe(original.createdAt);
  expect((await page.request.delete(`/api/v1/events/${event.id}`, { headers: origin })).status()).toBe(204); await page.reload(); await expect(page.getByText("No specific event linked.")).toBeVisible(); await expect(page.getByText("శుభం — collected and ready", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Delete update", exact: true }).click(); const dialog = page.getByRole("dialog"); await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused(); await capture(page, "delete");
  await page.keyboard.press("Escape"); await expect(dialog).not.toBeVisible(); await expect(page.getByRole("button", { name: "Delete update", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Delete update", exact: true }).click(); await dialog.getByRole("button", { name: "Delete update", exact: true }).click(); await expect(page).toHaveURL(/\/activities\?deleted=1$/); expect((await page.request.get(`/api/v1/activities/${id}`)).status()).toBe(404);
  for (let i = 0; i < 11; i++) expect((await page.request.post("/api/v1/activities", { headers: origin, data: { title: `Family update ${i}`, description: i === 10 ? "Literal [details]" : "Shared planning", activityType: "Logistics" } })).status()).toBe(201);
  await page.reload(); await expect(page.getByText("Showing 1–10 of 12 updates")).toBeVisible(); await capture(page, "overview"); await capture(page, "overview-mobile", 390); await widths(page);
  await page.getByRole("button", { name: "Next", exact: true }).click(); await expect(page.getByText("Showing 11–12 of 12 updates")).toBeVisible();
  await page.getByRole("textbox", { name: "Search activities" }).fill("[details]"); await expect(page.getByText("Showing 1–1 of 1 updates")).toBeVisible(); await expect(page.getByRole("textbox", { name: "Search activities" })).toBeFocused();
  await page.getByRole("textbox", { name: "Search activities" }).fill("not present"); await expect(page.getByRole("heading", { name: "No updates match your filters" })).toBeVisible(); await capture(page, "no-results");
  await page.getByRole("button", { name: "Clear filters" }).click(); await page.getByRole("combobox", { name: "Filter by source" }).selectOption("SYSTEM"); await expect(page.getByRole("heading", { name: "Event created: Haldi ceremony", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "View details for Event created: Haldi ceremony" }).click(); await expect(page.getByText("Automatically recorded by Make My Marriage. This update cannot be edited or deleted.")).toBeVisible(); await expect(page.getByRole("button", { name: "Delete update" })).toHaveCount(0); await capture(page, "automatic-details");
  await page.goto(`/activities/${id}`); await expect(page.getByRole("heading", { name: "Update unavailable" })).toBeVisible(); await capture(page, "unavailable"); expect(errors).toEqual([]);
});
test("mobile validation, preserved input, pending locks and save/delete retries", async ({ page }) => {
  await register(page, "retries"); const event = await createEvent(page); await page.setViewportSize({ width: 390, height: 900 }); await page.goto("/activities/new");
  await page.getByRole("button", { name: "Save update" }).click(); await expect(page.getByLabel(/^Title/)).toBeFocused(); await page.getByLabel(/^Title/).fill("   "); await page.getByRole("button", { name: "Save update" }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("highlighted");
  await page.getByLabel(/^Title/).fill("Outfits ready"); await page.getByLabel(/^Description/).fill("Keep these details"); await page.getByRole("textbox", { name: /^Category/ }).fill("Wardrobe"); await page.getByLabel(/^Related event/).selectOption(event.id); await capture(page, "add-mobile", 390); await widths(page);
  let release: () => void = () => {}; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/activities", async route => { await gate; await route.abort(); }); await page.getByRole("button", { name: "Save update" }).click(); await expect(page.getByRole("button", { name: "Cancel" })).toBeDisabled(); await expect(page.getByRole("button", { name: "Saving…" })).toBeDisabled(); await capture(page, "saving-mobile", 390); release();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("All your entered details have been preserved");
  await expect(page.getByLabel(/^Title/)).toHaveValue("Outfits ready"); await expect(page.getByLabel(/^Description/)).toHaveValue("Keep these details"); await expect(page.getByLabel(/^Related event/)).toHaveValue(event.id); await expect(page.getByRole("textbox", { name: /^Category/ })).toHaveValue("Wardrobe"); await capture(page, "save-error-mobile", 390);
  await page.unroute("**/api/v1/activities"); await page.getByRole("button", { name: "Retry save" }).click(); await expect(page).toHaveURL(/saved=created$/); const id = new URL(page.url()).pathname.split("/").pop()!;
  await capture(page, "details-mobile", 390); await widths(page);
  let releaseDelete: () => void = () => {}; const deleteGate = new Promise<void>(resolve => { releaseDelete = resolve; });
  await page.route(`**/api/v1/activities/${id}`, async route => { await deleteGate; await route.abort(); }); await page.getByRole("button", { name: "Delete update", exact: true }).click(); const dialog = page.getByRole("dialog"); await dialog.getByRole("button", { name: "Delete update", exact: true }).click();
  await expect(dialog.getByRole("button", { name: "Cancel" })).toBeDisabled(); await page.keyboard.press("Escape"); await expect(dialog).toBeVisible(); await capture(page, "delete-pending-mobile", 320); const box = await dialog.boundingBox(), button = await dialog.getByRole("button", { name: "Deleting…" }).boundingBox(); expect(button!.x).toBeGreaterThan(box!.x); expect(button!.x + button!.width).toBeLessThan(box!.x + box!.width); releaseDelete();
  await expect(dialog.getByRole("alert")).toContainText("Unable to delete"); await capture(page, "delete-error-mobile", 390); await page.unroute(`**/api/v1/activities/${id}`); await dialog.getByRole("button", { name: "Retry delete" }).click(); await expect(page).toHaveURL(/deleted=1$/);
});
test("independent feed/dashboard loading failure, retry and immediate dashboard completion activity", async ({ page }) => {
  await register(page, "loading"); await createEvent(page);
  let release: () => void = () => {}; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/activities?*", async route => { await gate; await route.continue(); }); await page.goto("/activities"); await expect(page.getByRole("status", { name: "Loading activities", exact: true })).toBeVisible(); await expect(page.getByRole("heading", { name: "No activity yet" })).toHaveCount(0); await capture(page, "loading"); release(); await expect(page.getByRole("heading", { name: "Event created: Haldi ceremony", exact: true })).toBeVisible(); await page.unroute("**/api/v1/activities?*");
  await page.route("**/api/v1/activities?*", route => route.abort()); await page.reload(); await expect(page.getByRole("heading", { name: "Couldn’t load activities" })).toBeVisible(); await capture(page, "load-error"); await page.unroute("**/api/v1/activities?*"); await page.getByRole("button", { name: "Retry activities" }).click(); await expect(page.getByRole("heading", { name: "Event created: Haldi ceremony", exact: true })).toBeVisible();
  await page.route("**/api/v1/dashboard?section=activities", route => route.abort()); await page.goto("/dashboard"); await expect(page.getByRole("heading", { name: "Couldn’t load recent activity" })).toBeVisible(); await expect(page.getByRole("heading", { name: "Haldi ceremony", exact: true })).toBeVisible(); await capture(page, "dashboard-error"); await page.unroute("**/api/v1/dashboard?section=activities"); await page.getByRole("button", { name: "Retry recent activity" }).click(); await expect(page.getByRole("heading", { name: "Recent Activity", exact: true })).toBeVisible();
  const task = await page.request.post("/api/v1/tasks", { headers: origin, data: { title: "Activity dashboard task", dueAt: "2020-01-01T12:00:00Z" } }); expect(task.status()).toBe(201); await page.reload(); await page.getByRole("checkbox", { name: "Mark Activity dashboard task completed" }).click(); await expect(page.getByRole("heading", { name: "Task completed: Activity dashboard task", exact: true })).toBeVisible(); await capture(page, "dashboard"); await capture(page, "dashboard-mobile", 390);
});
test("family can add/edit their manual update but cannot modify another author or automatic updates", async ({ page }) => {
  const user = await register(page, "family"); await createEvent(page);
  const response = await page.request.post("/api/v1/activities", { headers: origin, data: { title: "Other author's manual update" } }); const activity = (await response.json()).data;
  const client = new MongoClient(process.env.MMM_AUTH_TEST_URI!);
  try { const db = client.db("mmm-test-browser"); await db.collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "FAMILY_MEMBER" } }); await db.collection("activities").updateOne({ _id: new ObjectId(activity.id) }, { $set: { createdBy: new ObjectId() } }); } finally { await client.close(); }
  await page.goto(`/activities/${activity.id}`); await expect(page.getByRole("link", { name: "Edit update" })).toHaveCount(0); await expect(page.getByRole("button", { name: "Delete update" })).toHaveCount(0); await capture(page, "family-read-only"); expect((await page.request.delete(`/api/v1/activities/${activity.id}`, { headers: origin })).status()).toBe(403);
  await page.goto(`/activities/${activity.id}/edit`); await expect(page).toHaveURL(new RegExp(`/activities/${activity.id}$`));
  await page.goto("/activities/new"); await page.getByLabel(/^Title/).fill("Family's own update"); await page.getByRole("button", { name: "Save update" }).click(); await expect(page).toHaveURL(/saved=created$/); await expect(page.getByRole("link", { name: "Edit update" })).toBeVisible(); await expect(page.getByRole("button", { name: "Delete update", exact: true })).toBeVisible(); await capture(page, "family-own-mobile", 390);
  await page.getByRole("link", { name: "Edit update" }).click(); await page.getByLabel(/^Description/).fill("Family edit saved"); await page.getByRole("button", { name: "Save changes" }).click(); await expect(page).toHaveURL(/saved=updated$/);
});
