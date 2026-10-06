import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";

test.beforeAll(() => {
  if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run task browser tests with playwright.auth.config.ts and its isolated database.");
});
const origin = { origin: "http://localhost:3100" };
// Includes first compilation of new routes, screenshots, and several viewport checks.
test.setTimeout(180_000);
test.beforeEach(async () => {
  const uri = process.env.MMM_AUTH_TEST_URI!;
  if (!uri.startsWith("mongodb://127.0.0.1:")) throw new Error("Refusing unexpected browser test database.");
  const client = new MongoClient(uri);
  try {
    // Each fixture needs one signup; earlier auth/event tests share the local IP.
    // Reset only disposable test counters, leaving production limits unchanged.
    await client.db("mmm-test-browser").collection("rate_limits").deleteMany({});
  } finally { await client.close(); }
});
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: origin, data: {
    name: `Sai ${label}`, email: `tasks-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM",
    wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" },
  } });
  expect(response.status()).toBe(201);
}
async function checkWidths(page: Page, screen: string) {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), `${screen} overflow at ${width}`).toBe(false);
  }
}
async function capture(page: Page, name: string) {
  // Keep the sticky workspace header at the top of full-page evidence.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/${name}.png`, fullPage: true });
}

test("desktop checklist creation, persisted event/deadline, status, edit and delete confirmation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 }); await register(page, "desktop"); await page.goto("/tasks");
  await expect(page.getByRole("heading", { name: "Your wedding checklist starts here" })).toBeVisible();
  await capture(page, "tasks-empty-desktop");
  const response = await page.request.post("/api/v1/events", { headers: origin, data: { name: "Haldi", venue: "Family hall", startAt: "2027-02-28T10:00:00+05:30" } });
  const { data: event } = await response.json();
  await page.getByRole("link", { name: "Add your first task" }).click();
  await page.getByLabel(/Task title/).fill("Book photographer"); await page.getByLabel(/Description/).fill("Candid family photos and ceremony portraits.");
  await page.getByLabel(/Related event/).selectOption(event.id); await page.getByLabel("Deadline date").fill("2020-02-29"); await page.getByLabel("Time (IST)").fill("00:15");
  await page.getByRole("radio", { name: "High", exact: true }).check();
  await capture(page, "tasks-add-desktop");
  await page.getByRole("button", { name: "Create task", exact: true }).click(); await expect(page).toHaveURL(/\/tasks\/[a-f\d]{24}\?saved=created$/);
  const id = new URL(page.url()).pathname.split("/").pop()!;
  await expect(page.getByRole("heading", { name: "Book photographer", exact: true })).toBeVisible(); await expect(page.getByText("Overdue", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Haldi", exact: true })).toBeVisible();
  const client = new MongoClient(process.env.MMM_AUTH_TEST_URI!);
  try { const stored = await client.db("mmm-test-browser").collection("tasks").findOne({ _id: new ObjectId(id) }); expect(stored?.dueAt.toISOString()).toBe("2020-02-28T18:45:00.000Z"); expect(stored?.eventId.toString()).toBe(event.id); } finally { await client.close(); }
  await capture(page, "tasks-details-desktop");
  await page.getByRole("button", { name: "Completed", exact: true }).click(); await expect(page.getByRole("button", { name: "Completed", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Overdue", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Edit task", exact: true }).click();
  await expect(page.getByLabel("Deadline date")).toHaveValue("2020-02-29"); await expect(page.getByLabel("Time (IST)")).toHaveValue("00:15");
  await page.getByLabel(/Task title/).fill("Photographer confirmed"); await page.getByLabel(/Description/).fill(""); await page.getByRole("button", { name: "Clear deadline" }).click(); await page.getByLabel(/Related event/).selectOption("");
  await capture(page, "tasks-edit-desktop"); await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("heading", { name: "Photographer confirmed", exact: true })).toBeVisible(); await page.reload(); await expect(page.getByText("No deadline", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Back to tasks", exact: true }).click(); await expect(page.getByRole("progressbar", { name: "Task completion" })).toHaveAttribute("aria-valuenow", "100");
  await capture(page, "tasks-overview-desktop");
  await page.getByRole("link", { name: "View details for Photographer confirmed" }).click(); await page.getByRole("button", { name: "Delete task", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this task?" }); await expect(dialog).toBeVisible(); await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused();
  await capture(page, "tasks-delete-desktop"); await page.keyboard.press("Escape"); await expect(dialog).toBeHidden(); await expect(page.getByRole("button", { name: "Delete task", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Delete task", exact: true }).click(); await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  expect((await page.request.get(`/api/v1/tasks/${id}`)).status()).toBe(200);
  await page.getByRole("button", { name: "Delete task", exact: true }).click(); await dialog.getByRole("button", { name: "Delete task permanently" }).click();
  await expect(page).toHaveURL(/\/tasks\?deleted=1$/); expect((await page.request.get(`/api/v1/tasks/${id}`)).status()).toBe(404); expect((await page.request.get(`/api/v1/events/${event.id}`)).status()).toBe(200);
});

test("mobile validation, failed saves/status/deletes, retry and all screen widths", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 }); await register(page, "mobile"); await page.goto("/tasks");
  await capture(page, "tasks-empty-mobile");
  await page.getByRole("button", { name: "Open workspace menu" }).click(); await expect(page.getByRole("navigation", { name: "Wedding workspace" })).toBeVisible(); await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Book a photographer Create task" }).click(); await expect(page.getByLabel(/Task title/)).toHaveValue("Book a photographer");
  expect((await (await page.request.get("/api/v1/tasks")).json()).data.counts.total).toBe(0);
  await page.getByLabel(/Task title/).fill(""); await page.getByRole("button", { name: "Create task", exact: true }).click(); await expect(page.getByLabel(/Task title/)).toBeFocused();
  await page.getByLabel(/Task title/).fill("Arrange outfits"); await page.getByLabel("Deadline date").fill("2020-01-01"); await page.getByRole("button", { name: "Create task", exact: true }).click(); await expect(page.getByLabel("Time (IST)")).toBeFocused();
  await page.getByRole("button", { name: "Clear deadline" }).click();
  await page.route("**/api/v1/tasks", route => route.request().method() === "POST" ? route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ success: false, message: "Could not save. Please try again." }) }) : route.continue());
  await page.getByRole("button", { name: "Create task", exact: true }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("Could not save"); await expect(page.getByLabel(/Task title/)).toHaveValue("Arrange outfits");
  await capture(page, "tasks-add-mobile"); await checkWidths(page, "add"); await page.setViewportSize({ width: 390, height: 844 });
  await page.unroute("**/api/v1/tasks"); await page.getByRole("button", { name: "Create task", exact: true }).click(); await expect(page.getByRole("heading", { name: "Arrange outfits", exact: true })).toBeVisible();
  const id = new URL(page.url()).pathname.split("/").pop()!;
  await page.route("**/api/v1/tasks/*/status", route => route.abort()); await page.getByRole("button", { name: "Completed", exact: true }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("Could not update status"); await expect(page.getByRole("button", { name: "To do", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.unroute("**/api/v1/tasks/*/status"); await page.getByRole("button", { name: "In progress", exact: true }).click(); await expect(page.getByRole("button", { name: "In progress", exact: true })).toHaveAttribute("aria-pressed", "true");
  await capture(page, "tasks-details-mobile"); await checkWidths(page, "detail"); await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Edit task", exact: true }).click(); await expect(page.getByLabel(/Task title/)).toHaveValue("Arrange outfits"); await capture(page, "tasks-edit-mobile"); await checkWidths(page, "edit"); await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("link", { name: "Cancel", exact: true }).click(); await page.getByRole("button", { name: "Delete task", exact: true }).click();
  await page.route(`**/api/v1/tasks/${id}`, route => route.request().method() === "DELETE" ? route.abort() : route.continue());
  const dialog = page.getByRole("dialog", { name: "Delete this task?" }); await dialog.getByRole("button", { name: "Delete task permanently" }).click(); await expect(dialog.getByRole("alert")).toContainText("could not be deleted"); await expect(dialog.getByRole("button", { name: "Cancel" })).toBeEnabled();
  await capture(page, "tasks-delete-mobile"); await page.keyboard.press("Escape"); await page.unroute(`**/api/v1/tasks/${id}`);
  await page.getByRole("link", { name: "Back to tasks", exact: true }).click(); await expect(page.getByRole("heading", { name: "Wedding checklist", exact: true })).toBeVisible(); await expect(page.getByRole("article")).toHaveCount(1); await capture(page, "tasks-overview-mobile"); await checkWidths(page, "overview"); expect(errors).toEqual([]);
});

test("filters and no-results states retain global progress; removed event becomes wedding-wide", async ({ page }) => {
  await register(page, "filters");
  const response = await page.request.post("/api/v1/events", { headers: origin, data: { name: "Sangeet", venue: "Home", startAt: "2027-02-28T10:00:00Z" } }); const { data: event } = await response.json();
  await page.request.post("/api/v1/tasks", { headers: origin, data: { title: "Book [venue]", eventId: event.id, priority: "HIGH", dueAt: "2020-01-01T00:00:00Z" } });
  await page.request.post("/api/v1/tasks", { headers: origin, data: { title: "Outfits ready", status: "COMPLETED" } });
  await page.goto("/tasks"); await expect(page.getByRole("article")).toHaveCount(2);
  await page.getByLabel("Search tasks").fill("[venue]"); await page.getByLabel("Filter by priority").selectOption("HIGH"); await page.getByLabel("Filter by event").selectOption(event.id); await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page.getByRole("article")).toHaveCount(1); await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await page.getByLabel("Search tasks").fill("Missing"); await page.getByRole("button", { name: "Apply filters" }).click(); await expect(page.getByRole("heading", { name: "No tasks match these filters" })).toBeVisible();
  await page.getByRole("link", { name: "Clear filters", exact: true }).click(); await expect(page.getByLabel("Search tasks")).toHaveValue(""); await expect(page.getByRole("article")).toHaveCount(2);
  await page.getByRole("checkbox", { name: "Mark Outfits ready as to do" }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  await page.getByRole("checkbox", { name: "Mark Book [venue] completed", exact: true }).click();
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  await page.request.delete(`/api/v1/events/${event.id}`, { headers: origin }); await page.reload(); await expect(page.getByRole("article").filter({ hasText: "Book [venue]" })).toContainText("Wedding-wide");
  await page.goto("/tasks/000000000000000000000000"); await expect(page.getByRole("heading", { name: "Task not found" })).toBeVisible();
});
