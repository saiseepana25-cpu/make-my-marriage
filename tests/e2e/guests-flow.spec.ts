import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";

const origin = { origin: "http://localhost:3100" };
test.beforeAll(() => { if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run guest browser tests using the isolated auth configuration."); });
test.beforeEach(async () => {
  const uri = process.env.MMM_AUTH_TEST_URI!;
  if (!uri.startsWith("mongodb://127.0.0.1:")) throw new Error("Refusing unexpected browser test database.");
  const client = new MongoClient(uri);
  try { await client.db("mmm-test-browser").collection("rate_limits").deleteMany({}); } finally { await client.close(); }
});
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: origin, data: {
    name: "Sai", email: `guests-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM",
    wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" },
  } });
  expect(response.status()).toBe(201); return (await response.json()).data;
}
async function seed(page: Page) {
  const guests: { id: string; name: string }[] = [];
  for (let index = 0; index < 24; index++) {
    const response = await page.request.post("/api/v1/guests", { headers: origin, data: {
      name: index === 23 ? "Rajesh Sharma" : `Guest ${index}`, familyName: index % 2 ? "Sharma Family" : "",
      email: index === 23 ? "rajesh.sharma@example.com" : undefined, phone: index === 23 ? "+91 98201 12345" : undefined,
      numberInvited: index === 23 ? 2 : undefined, numberAttending: index === 23 ? 0 : undefined,
      notes: index === 23 ? "శుభం — family friend" : undefined,
      rsvpStatus: index < 10 ? "PENDING" : index < 22 ? "ATTENDING" : "NOT_ATTENDING",
    } });
    expect(response.status()).toBe(201); guests.push((await response.json()).data);
  }
  return guests;
}
async function summary(page: Page) { const response = await page.request.get("/api/v1/guests/summary"); expect(response.ok()).toBe(true); return (await response.json()).data; }
async function capture(page: Page, name: string, width = 1440) {
  await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow in ${name}`).toBe(false);
  await page.screenshot({ path: `test-results/guests-${name}.png`, fullPage: true });
}
async function widths(page: Page) {
  for (const width of [320, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow at ${width}`).toBe(false); }
}

test("guest lifecycle, optional zero/clear, global totals, literal search, filters and pagination", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await register(page, "lifecycle"); await page.goto("/guests");
  await expect(page.getByRole("heading", { name: "Your guest list starts here" })).toBeVisible();
  await capture(page, "empty-desktop");
  await page.getByRole("link", { name: "Add guest", exact: true }).click();
  await page.getByLabel(/Guest name/).fill("Guest [QA]"); await page.getByLabel(/Email address/).fill("qa@example.com");
  await page.getByLabel(/Phone number/).fill("+91 98201 12345"); await page.getByRole("textbox", { name: /Family name/ }).fill("Sharma Family");
  await page.getByLabel(/Number invited/).fill("0"); await page.getByLabel(/Number attending/).fill("0"); await page.getByLabel(/Notes/).fill("శుభం — family friend");
  await capture(page, "add-desktop"); await page.getByRole("button", { name: "Save guest", exact: true }).click();
  await expect(page).toHaveURL(/\/guests\/[a-f0-9]{24}\?saved=created$/);
  const id = new URL(page.url()).pathname.split("/").pop()!;
  await page.reload(); await expect(page.getByRole("heading", { name: "Guest [QA]", exact: true })).toBeVisible();
  await expect(page.getByText("శుభం — family friend", { exact: true })).toBeVisible(); await capture(page, "details-desktop");
  await page.getByRole("link", { name: "Edit guest", exact: true }).click();
  await expect(page.getByLabel(/Number invited/)).toHaveValue("0"); await page.getByLabel(/Number invited/).fill(""); await page.getByLabel(/Number attending/).fill(""); await page.getByLabel(/Notes/).fill("");
  await page.getByRole("radio", { name: "Attending", exact: true }).check(); await capture(page, "edit-desktop");
  await page.getByRole("button", { name: "Save changes" }).click(); await expect(page).toHaveURL(/saved=updated$/);
  expect(await summary(page)).toEqual({ total: 1, pending: 0, attending: 1, notAttending: 0 });
  await page.getByRole("button", { name: "Delete guest", exact: true }).click();
  const dialog = page.getByRole("dialog"); await expect(dialog.getByRole("button", { name: "Cancel" })).toBeFocused(); await capture(page, "delete-desktop");
  await page.keyboard.press("Escape"); await expect(dialog).not.toBeVisible(); await expect(page.getByRole("button", { name: "Delete guest", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "Delete guest", exact: true }).click(); await dialog.getByRole("button", { name: "Delete guest", exact: true }).click(); await expect(page).toHaveURL(/\/guests\?deleted=1$/);
  expect((await page.request.get(`/api/v1/guests/${id}`)).status()).toBe(404);
  const guests = await seed(page); await page.reload(); await expect(page.getByRole("heading", { name: "Rajesh Sharma", exact: true })).toBeVisible();
  expect(await summary(page)).toEqual({ total: 24, pending: 10, attending: 12, notAttending: 2 });
  await capture(page, "overview-desktop"); await capture(page, "overview-mobile", 390); await widths(page);
  await page.getByRole("button", { name: "Next", exact: true }).click(); await expect(page.getByText("Showing 9–16 of 24 guest records")).toBeVisible();
  await page.getByRole("textbox", { name: "Search guests" }).fill("rajesh.sharma@example.com"); await expect(page.getByText("1 matching guest records", { exact: true })).toBeVisible(); await expect(page.getByRole("textbox", { name: "Search guests" })).toBeFocused();
  expect((await summary(page)).total).toBe(24);
  await page.getByRole("textbox", { name: "Search guests" }).fill("nothing [literal]"); await expect(page.getByRole("heading", { name: "No guests match your filters" })).toBeVisible(); await capture(page, "no-results");
  await page.getByRole("button", { name: "Clear filters" }).click(); await page.getByRole("combobox", { name: "Filter by family" }).selectOption("none"); await expect(page.getByText("12 matching guest records", { exact: true })).toBeVisible();
  await page.getByRole("combobox", { name: "Filter by attendance" }).selectOption("PENDING"); await expect(page.getByText("5 matching guest records", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  expect((await page.request.delete(`/api/v1/guests/${guests[0].id}`, { headers: origin })).status()).toBe(204);
  expect(await summary(page)).toEqual({ total: 23, pending: 9, attending: 12, notAttending: 2 }); expect((await page.request.get(`/api/v1/guests/${guests[1].id}`)).status()).toBe(200);
  await page.goto("/dashboard"); await expect(page.getByRole("heading", { name: "Guests & Attendance", exact: true })).toBeVisible(); await capture(page, "dashboard"); expect(errors).toEqual([]);
});

test("mobile validation, preserved failed save, retry delete and unavailable guest", async ({ page }) => {
  await register(page, "retries"); await page.setViewportSize({ width: 390, height: 900 }); await page.goto("/guests/new");
  await page.getByRole("button", { name: "Save guest", exact: true }).click(); await expect(page.getByLabel(/Guest name/)).toBeFocused();
  await page.getByLabel(/Guest name/).fill("Rajesh Sharma"); await page.getByLabel(/Email address/).fill("bad@"); await page.getByRole("button", { name: "Save guest", exact: true }).click(); await expect(page.getByLabel(/Email address/)).toBeFocused();
  await page.getByLabel(/Email address/).fill("rajesh@example.com"); await page.getByLabel(/Number invited/).fill("-1"); await page.getByRole("button", { name: "Save guest", exact: true }).click(); await expect(page.getByLabel(/Number invited/)).toBeFocused();
  await page.getByLabel(/Number invited/).fill("2"); await page.getByLabel(/Number attending/).fill("1.5"); await page.getByRole("button", { name: "Save guest", exact: true }).click(); await expect(page.getByLabel(/Number attending/)).toBeFocused(); await capture(page, "validation-mobile", 390);
  await page.getByLabel(/Number attending/).fill("0"); await page.getByLabel(/Notes/).fill("Preserve these notes");
  await page.route("**/api/v1/guests", route => route.abort()); await page.getByRole("button", { name: "Save guest", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Your details are still here"); await expect(page.getByLabel(/Notes/)).toHaveValue("Preserve these notes"); await capture(page, "save-failure-mobile", 390); await widths(page);
  await page.unroute("**/api/v1/guests"); await page.getByRole("button", { name: "Retry save" }).click(); await expect(page).toHaveURL(/saved=created$/);
  const id = new URL(page.url()).pathname.split("/").pop()!;
  for (const width of [320, 390, 768]) { await page.setViewportSize({ width, height: 900 }); const heading = await page.getByRole("heading", { name: "Rajesh Sharma", exact: true }).boundingBox(); expect(heading!.width).toBeGreaterThan(120); }
  await capture(page, "details-mobile", 390); await widths(page); await capture(page, "details-responsive-desktop");
  await page.route(`**/api/v1/guests/${id}`, route => route.abort()); await page.getByRole("button", { name: "Delete guest", exact: true }).click();
  const dialog = page.getByRole("dialog"); await dialog.getByRole("button", { name: "Delete guest", exact: true }).click(); await expect(dialog.getByRole("alert")).toContainText("Unable to delete"); await capture(page, "delete-failure-mobile", 390); await widths(page);
  await expect(dialog.getByRole("button", { name: "Cancel" })).toHaveCount(1); await page.unroute(`**/api/v1/guests/${id}`); await dialog.getByRole("button", { name: "Retry delete" }).click(); await expect(page).toHaveURL(/deleted=1$/);
  await page.goto(`/guests/${id}`); await expect(page.getByRole("heading", { name: "Guest unavailable" })).toBeVisible(); await expect(page.getByRole("link", { name: "Back to guests" })).toHaveCount(1); await capture(page, "unavailable-mobile", 390);
});

test("independent guest totals/list/dashboard loading failures and retry", async ({ page }) => {
  await register(page, "loading"); await seed(page);
  let release: () => void = () => {}; const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/v1/guests*", async route => { await gate; await route.continue(); }); await page.goto("/guests");
  await expect(page.getByRole("status", { name: "Loading guest totals", exact: true })).toBeVisible(); await expect(page.getByRole("status", { name: "Loading guests", exact: true })).toBeVisible(); await expect(page.getByRole("definition")).toHaveCount(0); await capture(page, "loading");
  release(); await expect(page.getByRole("heading", { name: "Rajesh Sharma", exact: true })).toBeVisible(); await page.unroute("**/api/v1/guests*");
  await page.route("**/api/v1/guests/summary", route => route.abort()); await page.reload(); await expect(page.getByRole("heading", { name: "Couldn’t load guest totals" })).toBeVisible(); await expect(page.getByRole("heading", { name: "Rajesh Sharma", exact: true })).toBeVisible(); await capture(page, "totals-failure");
  await page.unroute("**/api/v1/guests/summary"); await page.getByRole("button", { name: "Retry guest totals" }).click(); await expect(page.getByRole("definition")).toHaveCount(4);
  await page.route("**/api/v1/guests?*", route => route.abort()); await page.reload(); await expect(page.getByRole("heading", { name: "Couldn’t load guest list" })).toBeVisible(); await expect(page.getByRole("definition")).toHaveCount(4); await capture(page, "list-failure");
  await page.unroute("**/api/v1/guests?*"); await page.getByRole("button", { name: "Retry guest list" }).click(); await expect(page.getByRole("heading", { name: "Rajesh Sharma", exact: true })).toBeVisible();
  await page.route("**/api/v1/dashboard?section=guests", route => route.abort()); await page.goto("/dashboard"); await expect(page.getByRole("heading", { name: "Couldn’t load dashboard guests" })).toBeVisible(); await capture(page, "dashboard-failure");
  await page.unroute("**/api/v1/dashboard?section=guests"); await page.getByRole("button", { name: "Retry dashboard guests" }).click(); await expect(page.getByRole("heading", { name: "Couldn’t load dashboard guests" })).toHaveCount(0);
});

test("family read-only guest list/details and blocked direct create/edit/delete", async ({ page }) => {
  const user = await register(page, "family"); const guests = await seed(page);
  const client = new MongoClient(process.env.MMM_AUTH_TEST_URI!);
  try { await client.db("mmm-test-browser").collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "FAMILY_MEMBER" } }); } finally { await client.close(); }
  await page.goto("/guests"); await expect(page.getByRole("heading", { name: "Rajesh Sharma", exact: true })).toBeVisible(); await expect(page.getByRole("link", { name: "Add guest", exact: true })).toHaveCount(0); await capture(page, "family-desktop"); await capture(page, "family-mobile", 390);
  await page.getByRole("textbox", { name: "Search guests" }).fill("Rajesh"); await expect(page.getByText("1 matching guest records", { exact: true })).toBeVisible(); await page.getByRole("link", { name: "View details for Rajesh Sharma" }).click();
  await expect(page.getByRole("link", { name: "Edit guest", exact: true })).toHaveCount(0); await expect(page.getByRole("button", { name: "Delete guest", exact: true })).toHaveCount(0); await capture(page, "family-details-mobile", 390);
  expect((await page.request.post("/api/v1/guests", { headers: origin, data: { name: "Forbidden", rsvpStatus: "PENDING" } })).status()).toBe(403);
  expect((await page.request.delete(`/api/v1/guests/${guests[23].id}`, { headers: origin })).status()).toBe(403);
  await page.goto("/guests/new"); await expect(page).toHaveURL(/\/guests$/); await page.goto(`/guests/${guests[23].id}/edit`); await expect(page).toHaveURL(/\/guests$/);
});
