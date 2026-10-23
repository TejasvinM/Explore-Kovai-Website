import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests. They need the Django API running (see the API's README).
 * `npx playwright test` builds and starts this site unless one is already running on BASE_URL.
 */
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  projects: [
    // each project looks like a different visitor, so the API's per-visitor login limit isn't shared
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, extraHTTPHeaders: { "X-Forwarded-For": "203.0.113.1" } } },
    { name: "tablet", use: { ...devices["Desktop Chrome"], viewport: { width: 820, height: 1180 }, hasTouch: true, extraHTTPHeaders: { "X-Forwarded-For": "203.0.113.2" } } },
    { name: "mobile", use: { ...devices["Pixel 7"], extraHTTPHeaders: { "X-Forwarded-For": "203.0.113.3" } } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 240_000,
  },
});
