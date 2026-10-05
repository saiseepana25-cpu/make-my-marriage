import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e", fullyParallel: false, workers: 1,
  forbidOnly: !!process.env.CI, retries: 0,
  // New workspace routes compile on first access in the isolated Next development server.
  globalSetup: "./tests/e2e/auth-setup.ts", timeout: 90_000,
  expect: { timeout: 30_000 },
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: "http://localhost:3100", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
