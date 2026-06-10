import { test, expect, type Page } from "@playwright/test";

// Chief role — agent module = "full" (super is excluded from /agent).
const CHIEF_EMAIL = "b.mirzayev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";
const COMPILE = 25_000;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(CHIEF_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("agent status dashboard renders stats, connected agents, and sync history", async ({
  page,
}) => {
  await login(page);
  await page.goto("/agent");

  await expect(page.getByRole("heading", { name: "EXE agent" })).toBeVisible({ timeout: COMPILE });

  // Stat tiles
  await expect(page.getByText("Aktiv tokenlar")).toBeVisible();
  await expect(page.getByText("24 soatlik sinxron")).toBeVisible();

  // Connected agents table + a seeded audit code
  await expect(page.getByRole("heading", { name: "Bogʻlangan agentlar" })).toBeVisible();
  await expect(page.getByText("AUD-2026-014").first()).toBeVisible();

  // Sync history with a completed session badge
  await expect(page.getByRole("heading", { name: "Sinxronlash tarixi" })).toBeVisible();
  await expect(page.getByText("Yakunlandi").first()).toBeVisible();

  // Synced findings section (seeded agent-synced findings → non-empty)
  await expect(page.getByRole("heading", { name: "Agentdan kelgan findinglar" })).toBeVisible();
  await expect(page.getByText(/F-2026-/).first()).toBeVisible();
});

test("EXE download button serves the published agent binary", async ({ page }) => {
  await login(page);
  await page.goto("/agent");
  await expect(page.getByRole("heading", { name: "EXE agent" })).toBeVisible({ timeout: COMPILE });

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: /EXE yuklab olish/ }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^AuditorAgent_v.*\.exe$/);
});
