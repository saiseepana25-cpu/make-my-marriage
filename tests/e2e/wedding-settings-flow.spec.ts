import { expect, test, type Page } from "@playwright/test";
import { MongoClient, ObjectId } from "mongodb";
const origin = { origin: "http://localhost:3100" };
test.beforeAll(() => { if (!process.env.MMM_AUTH_TEST_URI) throw new Error("Run Wedding Settings browser tests using the isolated auth configuration."); });
async function database() {
  const uri = process.env.MMM_AUTH_TEST_URI!;
  if (!uri?.startsWith("mongodb://127.0.0.1:")) throw new Error("Refusing unexpected browser test database.");
  return new MongoClient(uri);
}
test.beforeEach(async () => { const client = await database(); try { await client.db("mmm-test-browser").collection("rate_limits").deleteMany({}); } finally { await client.close(); } });
async function register(page: Page, label: string) {
  const response = await page.request.post("/api/v1/auth/register", { headers: origin, data: { name: "Sai", email: `settings-${label}-${Date.now()}@example.com`, password: "12345678", relationshipType: "GROOM", wedding: { groomName: "Sai", brideName: "Adya", weddingDate: "2027-02-28", location: "Hyderabad" } } });
  expect(response.status()).toBe(201); return (await response.json()).data;
}
async function capture(page: Page, name: string, width = 1440) {
  await page.setViewportSize({ width, height: 1000 }); await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow in ${name}`).toBe(false);
  await page.screenshot({ path: `test-results/settings-${name}.png`, fullPage: true });
}
test("wedding details persist, saved shell updates after saving, slug and events remain stable", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  await register(page, "saved"); const original = (await (await page.request.get("/api/v1/weddings/current")).json()).data;
  const eventResponse = await page.request.post("/api/v1/events", { headers: origin, data: { name: "Haldi", venue: "Family Hall", startAt: "2027-02-28T10:00:00+05:30" } }); expect(eventResponse.status()).toBe(201); const event = (await eventResponse.json()).data;
  await page.goto("/settings"); await expect(page.getByLabel(/Groom’s name/)).toHaveValue("Sai");
  await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled(); await capture(page, "owner");
  await page.getByLabel(/Groom’s name/).fill("Sai Kumar"); await page.getByLabel(/Bride’s name/).fill("Adya Devi"); await page.getByLabel(/Wedding date/).fill("2020-02-29"); await page.getByLabel(/Wedding location/).fill("విజయవాడ");
  await expect(page.getByRole("complementary", { name: "Wedding preview" })).toContainText("Sai Kumar & Adya Devi");
  await expect(page.getByRole("complementary", { name: "Wedding navigation" })).toContainText("Sai & Adya"); await capture(page, "dirty");
  await page.getByRole("button", { name: "Save changes" }).click(); await expect(page.getByRole("main").getByRole("status")).toContainText("Wedding details updated successfully.");
  await expect(page).toHaveURL(/\/settings$/); await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();
  await expect(page.getByRole("complementary", { name: "Wedding navigation" })).toContainText("Sai Kumar & Adya Devi"); await capture(page, "success");
  const saved = (await (await page.request.get("/api/v1/weddings/current")).json()).data; expect(saved.websiteSlug).toBe(original.websiteSlug); expect(saved.weddingDate).toBe("2020-02-29T00:00:00.000Z");
  expect((await (await page.request.get(`/api/v1/events/${event.id}`)).json()).data).toMatchObject({ startAt: event.startAt, venue: event.venue });
  await page.reload(); await expect(page.getByLabel(/Groom’s name/)).toHaveValue("Sai Kumar"); await expect(page.getByLabel(/Wedding date/)).toHaveValue("2020-02-29");
  await page.getByRole("button", { name: "Cancel", exact: true }).click(); await expect(page).toHaveURL(/\/dashboard$/); await expect(page.getByRole("main")).toContainText("Sai Kumar"); expect(errors).toEqual([]);
});
test("unsaved edits are retained on Cancel/Escape, workspace links, logout and browser Back", async ({ page }) => {
  await register(page, "discard"); await page.goto("/dashboard"); await page.getByRole("navigation", { name: "Wedding workspace", exact: true }).getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel(/Wedding location/).fill("Mumbai"); const dialog = page.getByRole("dialog");
  await page.getByRole("button", { name: "Cancel", exact: true }).click(); await expect(dialog.getByRole("button", { name: "Keep editing" })).toBeFocused(); await capture(page, "discard");
  await page.keyboard.press("Escape"); await expect(dialog).not.toBeVisible(); await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeFocused(); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Mumbai");
  await page.getByRole("navigation", { name: "Wedding workspace", exact: true }).getByRole("link", { name: "Events", exact: true }).click(); await expect(dialog).toBeVisible(); await dialog.getByRole("button", { name: "Keep editing" }).click(); await expect(page).toHaveURL(/\/settings$/);
  await page.getByRole("button", { name: "Log out", exact: true }).click(); await expect(dialog).toBeVisible(); await dialog.getByRole("button", { name: "Keep editing" }).click(); expect((await page.request.get("/api/v1/auth/me")).status()).toBe(200);
  await page.evaluate(() => history.back()); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/); await dialog.getByRole("button", { name: "Keep editing" }).click(); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Mumbai");
  await page.route("**/api/v1/auth/logout", route => route.abort());
  await page.getByRole("button", { name: "Log out", exact: true }).click(); await dialog.getByRole("button", { name: "Discard and leave" }).click();
  await expect(page.getByRole("banner").getByRole("alert")).toContainText("try again"); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad");
  await page.unroute("**/api/v1/auth/logout"); await page.getByLabel(/Wedding location/).fill("Chennai");
  await page.getByRole("button", { name: "Cancel", exact: true }).click(); await expect(dialog).toBeVisible(); await dialog.getByRole("button", { name: "Keep editing" }).click();
  await page.getByRole("navigation", { name: "Wedding workspace", exact: true }).getByRole("link", { name: "Events", exact: true }).click(); await dialog.getByRole("button", { name: "Discard and leave" }).click(); await expect(page).toHaveURL(/\/events$/);
  await page.goBack(); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad"); await page.getByLabel(/Wedding location/).fill("Mumbai");
  await page.evaluate(() => history.forward()); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/); await dialog.getByRole("button", { name: "Keep editing" }).click();
  await page.getByRole("link", { name: "Back to dashboard", exact: true }).click(); await dialog.getByRole("button", { name: "Discard and leave" }).click(); await expect(page).toHaveURL(/\/dashboard$/);
  expect((await (await page.request.get("/api/v1/weddings/current")).json()).data.location).toBe("Hyderabad");
});
test("history fallback restores and replays both Forward and Back without losing the draft", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "navigation", { value: undefined, configurable: true }));
  await register(page, "history-fallback"); await page.goto("/settings");
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad");
  await page.getByRole("navigation", { name: "Wedding workspace", exact: true }).getByRole("link", { name: "Events", exact: true }).click();
  await expect(page).toHaveURL(/\/events$/); await page.goBack();
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad");
  await page.getByLabel(/Wedding location/).fill("Mumbai");
  const dialog = page.getByRole("dialog");
  await page.evaluate(() => history.forward()); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Keep editing" }).click();
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Mumbai");
  await page.evaluate(() => history.forward()); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Discard and leave" }).click(); await expect(page).toHaveURL(/\/events$/);
  await page.getByRole("navigation", { name: "Wedding workspace", exact: true }).getByRole("link", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad"); await page.getByLabel(/Wedding location/).fill("Chennai");
  await page.evaluate(() => history.back()); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Keep editing" }).click(); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Chennai");
  await page.evaluate(() => history.back()); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Discard and leave" }).click(); await expect(page).toHaveURL(/\/events$/);
  expect((await (await page.request.get("/api/v1/weddings/current")).json()).data.location).toBe("Hyderabad");
});

test("native homepage hash links preserve the later Settings history guard", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "navigation", { value: undefined, configurable: true }));
  await register(page, "native-hash"); await page.goto("/");
  // Wait for root hydration, then use the actual native skip link.
  await expect.poll(() => page.evaluate(() => history.state?.__mmmWorkspacePosition)).toBeDefined();
  const skip = page.getByRole("link", { name: "Skip to content" });
  await skip.focus(); await skip.press("Enter");
  await expect(page).toHaveURL(/\/#main-content$/);
  await expect.poll(() => page.evaluate(() => history.state?.__mmmWorkspacePosition)).toBeDefined();
  await page.getByRole("link", { name: "Login", exact: true }).first().click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.getByRole("navigation", { name: "Wedding workspace", exact: true }).getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByLabel(/Wedding location/).fill("Mumbai");
  const dialog = page.getByRole("dialog");
  await page.evaluate(() => history.back()); await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Keep editing" }).click(); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Mumbai");
  await page.evaluate(() => history.back()); await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Discard and leave" }).click(); await expect(page).toHaveURL(/\/dashboard$/);
  expect((await (await page.request.get("/api/v1/weddings/current")).json()).data.location).toBe("Hyderabad");
});

test("history fallback guards a multi-entry jump to an untagged pre-workspace page", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "navigation", { value: undefined, configurable: true });
    // Construct same-document, untagged entries before Next/workspace hydration.
    if (location.pathname === "/settings") {
      history.replaceState({}, "", "/");
      for (const path of ["/signup", "/dashboard", "/settings"]) history.pushState({}, "", path);
    }
  });
  await register(page, "pre-workspace-history"); await page.goto("/settings");
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad"); await page.getByLabel(/Wedding location/).fill("Mumbai");
  const dialog = page.getByRole("dialog");
  await page.evaluate(() => history.go(-3)); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Keep editing" }).click(); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Mumbai");
  await page.evaluate(() => history.go(-3)); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Discard and leave" }).click(); await expect(page).toHaveURL("http://localhost:3100/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect((await (await page.request.get("/api/v1/weddings/current")).json()).data.location).toBe("Hyderabad");
});

test("history fallback recovers untagged Forward entries without losing edits", async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, "navigation", { value: undefined, configurable: true }));
  await register(page, "untagged-forward"); await page.goto("/settings");
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad");
  // Simulate retained same-document entries from before position tracking.
  // The prototype API bypasses both Next's and the guard's entry wrappers.
  await page.evaluate(() => {
    for (const path of ["/events", "/tasks"]) History.prototype.pushState.call(history, {}, "", path);
    history.go(-2);
  });
  await expect(page).toHaveURL(/\/settings$/);
  await page.getByLabel(/Wedding location/).fill("Mumbai");
  const dialog = page.getByRole("dialog");
  await page.evaluate(() => history.go(2)); await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/settings$/);
  await dialog.getByRole("button", { name: "Keep editing" }).click();
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Mumbai");
  await page.evaluate(() => history.go(2)); await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Discard and leave" }).click();
  await expect(page).toHaveURL(/\/tasks$/); await expect(page.getByRole("heading", { name: "Wedding checklist", exact: true })).toBeVisible();
  expect((await (await page.request.get("/api/v1/weddings/current")).json()).data.location).toBe("Hyderabad");
});

test("pre-existing null-state fragments preserve dirty Forward navigation", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "navigation", { value: undefined, configurable: true });
    if (location.pathname === "/settings" && location.hash === "#two") {
      history.replaceState(null, "", "/settings");
      history.pushState(null, "", "/settings#one");
      history.pushState(null, "", "/settings#two");
    }
  });
  await register(page, "old-fragments"); await page.goto("/settings#two");
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad");
  await page.evaluate(() => history.back()); await expect(page).toHaveURL(/\/settings#one$/);
  await expect.poll(() => page.evaluate(() => history.state?.__mmmWorkspacePosition)).toBe(-1);
  await page.getByLabel(/Wedding location/).fill("Mumbai"); const dialog = page.getByRole("dialog");
  await page.evaluate(() => history.forward()); await expect(dialog).toBeVisible(); await expect(page).toHaveURL(/\/settings#one$/);
  await dialog.getByRole("button", { name: "Keep editing" }).click(); await expect(page.getByLabel(/Wedding location/)).toHaveValue("Mumbai");
  await page.evaluate(() => history.forward()); await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Discard and leave" }).click(); await expect(page).toHaveURL(/\/settings#two$/);
  await expect(page.getByLabel(/Wedding location/)).toHaveValue("Hyderabad");
  expect((await (await page.request.get("/api/v1/weddings/current")).json()).data.location).toBe("Hyderabad");
});

test("mobile validation, failed save recovery, pending locks and responsive preview", async ({ page }) => {
  await register(page, "mobile"); await page.setViewportSize({ width: 390, height: 900 }); await page.goto("/settings");
  await page.getByLabel(/Groom’s name/).fill(""); await page.getByRole("button", { name: "Save changes" }).click(); await expect(page.getByLabel(/Groom’s name/)).toBeFocused(); await expect(page.getByRole("main").getByRole("alert")).toContainText("highlighted"); await capture(page, "validation-mobile", 390);
  await page.getByLabel(/Groom’s name/).fill("Sai Kumar"); await page.getByLabel(/Bride’s name/).fill("Adya Devi"); await page.getByLabel(/Wedding date/).fill("2020-02-29"); await page.getByLabel(/Wedding location/).fill("Bengaluru & Hyderabad");
  await page.getByRole("button", { name: "Open workspace menu" }).click();
  const eventsLink = page.getByRole("navigation", { name: "Wedding workspace", exact: true }).getByRole("link", { name: "Events", exact: true });
  await eventsLink.click(); await expect(page.getByRole("dialog")).toBeVisible(); await capture(page, "discard-mobile", 320);
  await page.keyboard.press("Escape"); await expect(eventsLink).toBeFocused(); await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Close workspace menu" }).click();
  await page.getByLabel(/Groom’s name/).fill("G".repeat(100)); await page.getByLabel(/Bride’s name/).fill("B".repeat(100)); await page.getByLabel(/Wedding location/).fill("L".repeat(200));
  for (const width of [320, 390, 768, 1024, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), `Overflow at ${width}`).toBe(false); }
  await page.getByLabel(/Groom’s name/).fill("Sai Kumar"); await page.getByLabel(/Bride’s name/).fill("Adya Devi"); await page.getByLabel(/Wedding location/).fill("Bengaluru & Hyderabad");
  let release!: () => void; const gate = new Promise<void>(done => { release = done; });
  await page.route("**/api/v1/weddings/current", async route => { if (route.request().method() !== "PUT") return route.continue(); await gate; await route.abort(); });
  await page.getByRole("button", { name: "Save changes" }).click(); await expect(page.getByLabel(/Groom’s name/)).toBeDisabled(); await expect(page.getByRole("button", { name: "Cancel", exact: true })).toBeDisabled(); await capture(page, "saving-mobile", 390); release();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("All your entered details have been preserved.");
  await expect(page.getByLabel(/Bride’s name/)).toHaveValue("Adya Devi"); await expect(page.getByLabel(/Wedding date/)).toHaveValue("2020-02-29"); await expect(page.getByRole("complementary", { name: "Wedding preview" })).toContainText("Bengaluru & Hyderabad"); await capture(page, "failed-mobile", 390);
  await page.unroute("**/api/v1/weddings/current"); await page.getByRole("button", { name: "Save changes" }).click(); await expect(page.getByRole("main").getByRole("status")).toContainText("successfully"); await capture(page, "saved-mobile", 320);
});
test("loading/retry/session/unavailable states and family read-only access", async ({ page }) => {
  const user = await register(page, "states");
  let release!: () => void; const gate = new Promise<void>(done => { release = done; });
  await page.route("**/api/v1/weddings/current", async route => { await gate; await route.abort(); }); await page.goto("/settings"); await expect(page.getByRole("status", { name: "Loading wedding settings" })).toBeVisible(); await capture(page, "loading"); release();
  await expect(page.getByRole("heading", { name: "Couldn’t load wedding settings" })).toBeVisible(); await capture(page, "load-error"); await page.unroute("**/api/v1/weddings/current"); await page.getByRole("button", { name: "Retry", exact: true }).click(); await expect(page.getByLabel(/Groom’s name/)).toHaveValue("Sai");
  for (const [status, heading] of [[401, "Session expired"], [404, "Wedding workspace unavailable"]] as const) {
    await page.route("**/api/v1/weddings/current", route => route.fulfill({ status, contentType: "application/json", body: JSON.stringify({ success: false }) })); await page.reload(); await expect(page.getByRole("heading", { name: heading })).toBeVisible(); await capture(page, `load-${status}`); await page.unroute("**/api/v1/weddings/current");
  }
  const client = await database(); try { await client.db("mmm-test-browser").collection("users").updateOne({ _id: new ObjectId(user.id) }, { $set: { role: "FAMILY_MEMBER", name: "Kavitha" } }); } finally { await client.close(); }
  await page.reload(); await expect(page.getByText("Only the wedding owner or an admin can edit these details.")).toBeVisible(); await expect(page.getByRole("textbox")).toHaveCount(0); await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(0); await capture(page, "family"); await capture(page, "family-mobile", 390);
  expect((await page.request.put("/api/v1/weddings/current", { headers: origin, data: { location: "Mumbai" } })).status()).toBe(403);
});
