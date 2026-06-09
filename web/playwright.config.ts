import { defineConfig, devices } from "@playwright/test";

// E2E + visual-regression tests. Specs live in ./e2e. The dev server is started
// automatically (reused if already running). Visual fidelity (the ≥90% design rule)
// is checked with expect(page).toHaveScreenshot() against committed baselines.
export default defineConfig({
  testDir: "./e2e",
  // Push schema + seed Postgres before the suite (needs `docker compose up -d db`).
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry heals transient login timeouts (concurrent Argon2id verify is CPU-heavy).
  retries: process.env.CI ? 2 : 1,
  // Cap concurrency so parallel logins + Server Action refreshes don't overload the
  // single dev server (which makes RSC re-renders slow → flaky waits).
  workers: process.env.CI ? 2 : 2,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  expect: {
    // Generous default — Server-Action auto-refresh under load can take a few seconds.
    timeout: 10_000,
    // Tolerance for visual snapshots — supports the "≥90% match" fidelity rule.
    // Animations are frozen so cinematic motion doesn't make snapshots flaky.
    toHaveScreenshot: { maxDiffPixelRatio: 0.1, animations: "disabled" },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
