import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";
const COMPILE = 25_000;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

// Read-only drive (no persistence) so it doesn't dirty the /settings visual snapshot.
test("settings: section nav + toggle (super)", async ({ page }) => {
  await login(page);
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Sozlamalar" })).toBeVisible({ timeout: COMPILE });
  await expect(page.getByText("Tashkilot maʼlumotlari")).toBeVisible();

  // KPI section shows the editable rules.
  await page.getByRole("button", { name: /KPI qoidalari/ }).click();
  await expect(page.getByText("KPI ball qoidalari (KpiRule)")).toBeVisible();

  // Security section has toggle switches.
  await page.getByRole("button", { name: /Xavfsizlik & saqlash/ }).click();
  await expect(page.getByText("Autentifikatsiya", { exact: true })).toBeVisible();
  const firstSwitch = page.locator(".set-switch").first();
  await expect(firstSwitch).toHaveAttribute("data-on", "true");
  await firstSwitch.click();
  await expect(firstSwitch).toHaveAttribute("data-on", "false");
});
