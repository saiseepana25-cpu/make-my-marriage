import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";
const origin = { origin: "http://localhost:3100" };
test.beforeAll(() => { if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Budget browser tests require the isolated auth configuration."); });
test.beforeEach(async () => {
  const uri = process.env.MMM_AUTH_TEST_URI!; if (!uri.startsWith("mongodb://127.0.0.1:")) throw new Error("Unexpected browser database.");
  const client = new MongoClient(uri); try { await client.db("mmm-test-browser").collection("rate_limits").deleteMany({}); } finally { await client.close(); }
});
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: origin, data: { name: "Sai", email: `budget-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } } });
  expect(response.status()).toBe(201); return (await response.json()).data;
}
async function capture(page: Page, name: string, width = 1440) {
  await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => document.fonts.ready); await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), name).toBe(false);
  await page.screenshot({ path: `test-results/budget-${name}.png`, fullPage: true });
}
async function widths(page: Page) {
  for (const width of [320, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow ${page.url()} at ${width}`).toBe(false); }
}
async function seed(page: Page) {
  const response = await page.request.post("/api/v1/events", { headers: origin, data: { name: "Wedding ceremony", venue: "Family hall", startAt: "2027-02-28T10:00:00+05:30" } });
  expect(response.status()).toBe(201); const event = (await response.json()).data;
  const inputs = [
    { name: "Venue booking", category: "Venue", amount: 300000, paidAmount: 200000, eventId: event.id, paidByName: "Sai", notes: "Wedding venue deposit." },
    { name: "Wedding catering", category: "Catering", amount: 200000, paidAmount: 150000, eventId: event.id },
    { name: "Photography package", category: "Photography", amount: 100000, paidAmount: 100000 },
    { name: "Haldi decorations", category: "Decoration", amount: 50000, paidAmount: 0 },
  ];
  const expenses = [];
  for (const input of inputs) { const r = await page.request.post("/api/v1/expenses", { headers: origin, data: input }); expect(r.status()).toBe(201); expenses.push((await r.json()).data); }
  expect((await page.request.put("/api/v1/budget", { headers: origin, data: { totalBudget: 1000000 } })).status()).toBe(200);
  return { event, expenses };
}
test("desktop budget and expense CRUD, saved zero/over-budget, real dashboard totals and filtering", async ({ page }) => {
  await register(page, "desktop"); await page.setViewportSize({ width: 1440, height: 1000 }); await page.goto("/budget");
  await expect(page.getByRole("heading", { name: "Your expense ledger starts here" })).toBeVisible(); await expect(page.getByText("Not set", { exact: true })).toBeVisible();
  await capture(page, "empty-desktop");
  await page.getByRole("link", { name: "Set / edit budget" }).click(); await page.getByLabel("Total wedding budget (₹)").fill("1000000"); await capture(page, "set-desktop");
  await page.getByRole("button", { name: "Save budget" }).click(); await expect(page).toHaveURL(/\/budget\?saved=budget$/); await expect(page.getByRole("main").getByRole("status").filter({ hasText: "saved successfully" })).toBeVisible();
  await page.getByRole("link", { name: "Add expense", exact: true }).click(); await page.getByLabel(/Expense name/).fill("Venue [booking]"); await page.getByLabel(/Category/).fill("Venue");
  await page.getByLabel(/Total amount/).fill("300000"); await page.getByLabel(/Paid amount/).fill("200000"); await page.getByLabel(/Paid by/).fill("Sai"); await page.getByLabel(/Notes/).fill("శుభం — Wedding venue deposit.");
  await capture(page, "add-desktop"); await page.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(page).toHaveURL(/\/budget\/expenses\/[a-f\d]{24}\?saved=created$/); const id = new URL(page.url()).pathname.split("/").pop()!;
  await expect(page.getByRole("heading", { name: "Venue [booking]", exact: true })).toBeVisible(); await page.reload(); await expect(page.getByText("శుభం — Wedding venue deposit.")).toBeVisible();
  await capture(page, "details-desktop"); await page.getByRole("link", { name: "Edit expense", exact: true }).click(); await expect(page.getByLabel(/Paid amount/)).toHaveValue("200000");
  await page.getByLabel(/Paid amount/).fill("300000"); await page.getByLabel(/Notes/).fill(""); await capture(page, "edit-desktop"); await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Paid", { exact: true })).toBeVisible(); await expect(page.getByText("No notes added.")).toBeVisible();
  await page.getByRole("button", { name: "Delete expense", exact: true }).click(); const dialog = page.getByRole("dialog", { name: "Delete this expense?" }); await expect(dialog.getByRole("button", { name: "Cancel", exact: true })).toBeFocused(); await capture(page, "delete-desktop");
  await page.keyboard.press("Escape"); await expect(dialog).toBeHidden(); await expect(page.getByRole("button", { name: "Delete expense", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Delete expense", exact: true }).click(); await dialog.getByRole("button", { name: "Delete expense permanently" }).click(); await expect(page).toHaveURL(/\/budget\?deleted=1$/);
  expect((await page.request.get(`/api/v1/expenses/${id}`)).status()).toBe(404);
  const { expenses } = await seed(page); await page.reload(); await expect(page.getByRole("progressbar", { name: "Budget utilization" })).toHaveAttribute("aria-valuenow", "65");
  await expect(page.getByRole("heading", { name: "Venue booking", exact: true })).toBeVisible(); await capture(page, "overview-desktop"); await capture(page, "overview-mobile", 390); await widths(page);
  await page.getByRole("textbox", { name: "Search expenses" }).fill("nothing"); await page.getByRole("button", { name: "Apply filters" }).click(); await expect(page.getByRole("heading", { name: "No expenses match these filters" })).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Budget utilization" })).toHaveAttribute("aria-valuenow", "65"); await page.getByRole("button", { name: "View all expenses" }).click(); await expect(page.getByRole("heading", { name: "Venue booking", exact: true })).toBeVisible();
  await page.request.put("/api/v1/budget", { headers: origin, data: { totalBudget: 0 } }); await page.reload(); await expect(page.getByText("Over budget by", { exact: true })).toBeVisible(); await expect(page.getByText("Unavailable", { exact: true })).toBeVisible(); await capture(page, "zero-mobile", 390);
  await page.request.put("/api/v1/budget", { headers: origin, data: { totalBudget: 500000 } }); await page.reload(); await expect(page.getByRole("progressbar", { name: "Budget utilization" })).toHaveAttribute("aria-valuetext", "130% of budget used"); await capture(page, "over-desktop");
  await page.request.put("/api/v1/budget", { headers: origin, data: { totalBudget: 1000000 } }); await page.goto("/dashboard"); await expect(page.getByRole("progressbar", { name: "Dashboard budget utilization" })).toHaveAttribute("aria-valuenow", "65"); await capture(page, "dashboard-desktop");
  await page.goto(`/budget/expenses/${expenses[0].id}`); await capture(page, "details-mobile", 390); await widths(page);
});
test("mobile validation, save/delete failure retention and independent summary/list retries", async ({ page }) => {
  await register(page, "mobile"); await page.setViewportSize({ width: 390, height: 844 }); await page.goto("/budget/expenses/new");
  await page.getByRole("button", { name: "Add expense", exact: true }).click(); await expect(page.getByLabel(/Expense name/)).toBeFocused();
  await page.getByLabel(/Expense name/).fill("Custom family cost"); await page.getByLabel(/Category/).fill("Family traditions"); await page.getByLabel(/Total amount/).fill("100"); await page.getByLabel(/Paid amount/).fill("101"); await page.getByRole("button", { name: "Add expense", exact: true }).click(); await expect(page.getByLabel(/Paid amount/)).toBeFocused();
  await page.getByLabel(/Paid amount/).fill("0"); await page.route("**/api/v1/expenses", route => route.request().method() === "POST" ? route.abort() : route.continue()); await page.getByRole("button", { name: "Add expense", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Your details are still here"); await expect(page.getByLabel(/Expense name/)).toHaveValue("Custom family cost"); await capture(page, "add-mobile", 390); await widths(page);
  await page.unroute("**/api/v1/expenses"); await page.getByRole("button", { name: "Add expense", exact: true }).click(); await expect(page.getByRole("heading", { name: "Custom family cost", exact: true })).toBeVisible();
  const id = new URL(page.url()).pathname.split("/").pop()!;
  await page.route(`**/api/v1/expenses/${id}`, route => route.request().method() === "DELETE" ? route.abort() : route.continue()); await page.getByRole("button", { name: "Delete expense", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Delete this expense?" }); await dialog.getByRole("button", { name: "Delete expense permanently" }).click(); await expect(dialog.getByRole("alert")).toContainText("Could not delete"); await capture(page, "delete-mobile", 390); await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.goto("/budget/edit"); await page.getByLabel("Total wedding budget (₹)").fill("0"); await page.route("**/api/v1/budget", route => route.request().method() === "PUT" ? route.abort() : route.continue()); await page.getByRole("button", { name: "Save budget" }).click(); await expect(page.getByRole("main").getByRole("alert")).toContainText("Your amount is still here"); await capture(page, "set-mobile", 390); await widths(page);
  await page.unroute("**/api/v1/budget"); await page.getByRole("button", { name: "Save budget" }).click(); await expect(page).toHaveURL(/\/budget\?saved=budget$/);
  await page.route("**/api/v1/budget", route => route.abort()); await page.reload(); await expect(page.getByRole("heading", { name: "Couldn’t load budget summary" })).toBeVisible(); await expect(page.getByRole("heading", { name: "Custom family cost", exact: true })).toBeVisible(); await capture(page, "summary-error-mobile", 390);
  await page.unroute("**/api/v1/budget"); await page.getByRole("button", { name: "Retry budget summary" }).click(); await expect(page.getByRole("heading", { name: "Couldn’t load budget summary" })).toHaveCount(0);
  await page.route("**/api/v1/expenses?*", route => route.abort()); await page.reload(); await expect(page.getByRole("heading", { name: "Couldn’t load expenses" })).toBeVisible(); await expect(page.getByText("Over budget by", { exact: true })).toBeVisible(); await capture(page, "list-error-mobile", 390);
  await page.unroute("**/api/v1/expenses?*"); await page.getByRole("button", { name: "Retry expenses" }).click(); await expect(page.getByRole("heading", { name: "Custom family cost", exact: true })).toBeVisible();
  await page.goto("/budget/expenses/bad"); await expect(page.getByRole("heading", { name: "Expense not found" })).toBeVisible();
});
test("family sees real populated finances without mutation controls or API permissions", async ({ page }) => {
  const user = await register(page, "family"), { expenses } = await seed(page);
  const client = new MongoClient(process.env.MMM_AUTH_TEST_URI!); try { await client.db("mmm-test-browser").collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "FAMILY_MEMBER" } }); } finally { await client.close(); }
  await page.goto("/budget"); await expect(page.getByRole("heading", { name: "Venue booking", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Add expense", exact: true })).toHaveCount(0); await expect(page.getByRole("link", { name: "Set / edit budget" })).toHaveCount(0); await capture(page, "family-desktop"); await capture(page, "family-mobile", 390);
  await page.goto(`/budget/expenses/${expenses[0].id}`); await expect(page.getByRole("button", { name: "Delete expense", exact: true })).toHaveCount(0); await expect(page.getByRole("link", { name: "Edit expense", exact: true })).toHaveCount(0);
  expect((await page.request.put("/api/v1/budget", { headers: origin, data: { totalBudget: 0 } })).status()).toBe(403);
  expect((await page.request.post("/api/v1/expenses", { headers: origin, data: { name: "No", category: "Venue", amount: 100 } })).status()).toBe(403);
  await page.goto("/budget/expenses/new"); await expect(page).toHaveURL(/\/budget$/); await page.goto("/budget/edit"); await expect(page).toHaveURL(/\/budget$/);
});
test("budget loading and dashboard budget failure do not fabricate figures or block other sections", async ({ page }) => {
  await register(page, "loading"); await seed(page);
  let release: () => void = () => {}; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/budget", async route => { await gate; await route.continue(); });
  await page.route("**/api/v1/expenses?*", async route => { await gate; await route.continue(); });
  await page.goto("/budget"); await expect(page.getByRole("status", { name: "Loading budget summary", exact: true })).toBeVisible(); await expect(page.getByRole("status", { name: "Loading expenses", exact: true })).toBeVisible();
  await expect(page.getByText("₹6,50,000", { exact: true })).toHaveCount(0); await capture(page, "loading-desktop"); await capture(page, "loading-mobile", 390);
  release(); await expect(page.getByRole("heading", { name: "Venue booking", exact: true })).toBeVisible(); await page.unroute("**/api/v1/budget"); await page.unroute("**/api/v1/expenses?*");
  await page.goto("/budget/expenses/new"); await page.getByLabel(/Expense name/).fill("Mobile form"); await page.getByLabel(/Category/).fill("Gifts"); await page.getByLabel(/Total amount/).fill("100"); await capture(page, "add-clean-mobile", 390); await widths(page);
  await page.route("**/api/v1/dashboard?section=budget", route => route.abort()); await page.goto("/dashboard"); await expect(page.getByRole("heading", { name: "Couldn’t load budget", exact: true })).toBeVisible(); await expect(page.getByRole("heading", { name: "Your wedding checklist starts here" })).toBeVisible(); await expect(page.getByRole("heading", { name: "Upcoming Events & Ceremony Timeline" })).toBeVisible(); await capture(page, "dashboard-error-mobile", 390);
  await page.unroute("**/api/v1/dashboard?section=budget"); await page.getByRole("button", { name: "Retry budget", exact: true }).click(); await expect(page.getByRole("progressbar", { name: "Dashboard budget utilization" })).toHaveAttribute("aria-valuenow", "65");
});
