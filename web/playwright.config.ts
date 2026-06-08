import { defineConfig, devices } from "@playwright/test";

// E2E + visual-regression tests. Specs live in ./e2e. The dev server is started
// automatically (reused if already running). Visual fidelity (the ≥90% design rule)
// is checked with expect(page).toHaveScreenshot() against committed baselines.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  expect: {
    // Tolerance for visual snapshots — supports the "≥90% match" fidelity rule.
    toHaveScreenshot: { maxDiffPixelRatio: 0.1 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
