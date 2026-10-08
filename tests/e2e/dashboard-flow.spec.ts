import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";

const origin = { origin: "http://localhost:3100" };
test.beforeAll(() => { if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run dashboard browser tests using the isolated auth configuration."); });
test.beforeEach(async () => {
  const uri = process.env.MMM_AUTH_TEST_URI!;
  if (!uri.startsWith("mongodb://127.0.0.1:")) throw new Error("Refusing unexpected browser test database.");
  const client = new MongoClient(uri);
  try { await client.db("mmm-test-browser").collection("rate_limits").deleteMany({}); } finally { await client.close(); }
});
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: origin, data: {
    name: "Sai", email: `dashboard-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM",
    wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" },
  } });
  expect(response.status()).toBe(201); return (await response.json()).data;
}
async function seed(page: Page) {
  const eventResponse = await page.request.post("/api/v1/events", { headers: origin, data: { name: "Haldi ceremony", venue: "Family Courtyard", startAt: "2099-01-01T10:00:00+05:30" } });
  expect(eventResponse.status()).toBe(201); const { data: event } = await eventResponse.json();
  const response = await page.request.post("/api/v1/tasks", { headers: origin, data: { title: "Finalize catering menu", eventId: event.id, dueAt: "2020-01-01T18:00:00+05:30", priority: "HIGH", status: "IN_PROGRESS" } });
  expect(response.status()).toBe(201); const { data: task } = await response.json();
  const complete = await page.request.post("/api/v1/tasks", { headers: origin, data: { title: "Photographer booked", status: "COMPLETED" } });
  expect(complete.status()).toBe(201); return { event, task };
}
async function capture(page: Page, name: string, width: number) {
  await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow in ${name}`).toBe(false);
  await page.screenshot({ path: `test-results/dashboard-${name}.png`, fullPage: true });
}

test("dashboard empty, saved task/event data, completion and real destination links on desktop/mobile", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await register(page, "overview"); await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Sai & Adya", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your wedding checklist starts here" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Your celebrations start here" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await expect(page.getByRole("complementary", { name: "Upcoming planning features" }).getByText("Coming soon", { exact: true })).toHaveCount(2);
  await expect(page.getByRole("navigation", { name: "Wedding workspace" }).getByRole("link", { name: "Budget", exact: true })).toHaveCount(1);
  await capture(page, "empty-desktop", 1440); await capture(page, "empty-mobile", 390);
  const { event, task } = await seed(page); await page.reload();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await expect(page.getByRole("heading", { name: "Haldi ceremony", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Finalize catering menu", exact: true })).toHaveAttribute("href", `/tasks/${task.id}`);
  await expect(page.getByRole("link", { name: "View event: Haldi ceremony" })).toHaveAttribute("href", `/events/${event.id}`);
  await capture(page, "overview-desktop", 1440); await capture(page, "overview-mobile", 390);
  for (const width of [320, 768, 1024, 1280, 1536]) {
    await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  }
  await page.getByRole("checkbox", { name: "Mark Finalize catering menu completed" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await expect(page.getByRole("heading", { name: "No tasks needing attention" })).toBeVisible();
  await page.reload(); await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  await page.getByRole("link", { name: "View event: Haldi ceremony" }).click(); await expect(page).toHaveURL(new RegExp(`/events/${event.id}$`));
  expect(errors).toEqual([]);
});

test("loading shows skeletons, task failure leaves events usable and Retry recovers only tasks", async ({ page }) => {
  await register(page, "task-error"); await seed(page);
  let release: () => void = () => {}; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/dashboard?section=*", async route => { await gate; await route.continue(); });
  await page.goto("/dashboard");
  await expect(page.getByRole("status", { name: "Loading tasks", exact: true })).toBeVisible();
  await expect(page.getByRole("status", { name: "Loading events", exact: true })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Your wedding checklist starts here" })).toHaveCount(0);
  await capture(page, "loading-desktop", 1440); await capture(page, "loading-mobile", 390);
  release(); await expect(page.getByRole("progressbar")).toBeVisible(); await page.unroute("**/api/v1/dashboard?section=*");
  let eventRequests = 0;
  await page.route("**/api/v1/dashboard?section=events", async route => { eventRequests++; await route.continue(); });
  await page.route("**/api/v1/dashboard?section=tasks", route => route.fulfill({ status: 500, json: { success: false, message: "Failed", data: null, error: { code: "INTERNAL_ERROR", details: [] } } }));
  await page.reload(); await expect(page.getByRole("heading", { name: "Couldn’t load tasks" })).toBeVisible();
  await expect(page.getByRole("link", { name: "View event: Haldi ceremony" })).toBeVisible(); await expect(page.getByRole("progressbar")).toHaveCount(0);
  await capture(page, "task-error-desktop", 1440); await capture(page, "task-error-mobile", 390);
  const requestsBeforeRetry = eventRequests;
  await page.unroute("**/api/v1/dashboard?section=tasks"); await page.getByRole("button", { name: "Retry tasks" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50"); expect(eventRequests).toBe(requestsBeforeRetry);
});

test("event failure preserves tasks, failed completion shows an error, and retry recovers events", async ({ page }) => {
  await register(page, "event-error"); const { task } = await seed(page);
  await page.route("**/api/v1/dashboard?section=events", route => route.fulfill({ status: 500, json: { success: false, data: null, message: "Failed", error: { code: "INTERNAL_ERROR", details: [] } } }));
  await page.goto("/dashboard"); await expect(page.getByRole("heading", { name: "Couldn’t load events" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await page.route(`**/api/v1/tasks/${task.id}/status`, route => route.fulfill({ status: 500, json: { success: false, data: null, message: "Could not update status. Please try again.", error: { code: "INTERNAL_ERROR", details: [] } } }));
  await page.getByRole("checkbox", { name: "Mark Finalize catering menu completed" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Could not update status" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await capture(page, "event-error-desktop", 1440); await capture(page, "event-error-mobile", 390);
  await page.unroute("**/api/v1/dashboard?section=events"); await page.getByRole("button", { name: "Retry events" }).click();
  await expect(page.getByRole("heading", { name: "Haldi ceremony", exact: true })).toBeVisible();
});

test("family role can read the overview but cannot create or complete unassigned tasks", async ({ page }) => {
  const user = await register(page, "family"); await seed(page);
  const client = new MongoClient(process.env.MMM_AUTH_TEST_URI!);
  try { await client.db("mmm-test-browser").collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "FAMILY_MEMBER" } }); } finally { await client.close(); }
  await page.goto("/dashboard"); await expect(page.getByRole("progressbar")).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Add task", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Add event", exact: true })).toHaveCount(0);
});
