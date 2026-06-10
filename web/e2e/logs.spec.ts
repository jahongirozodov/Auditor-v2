import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super (sees all logs, admin filters)
const DEMO_PASSWORD = "Auditor!2026";
const COMPILE = 25_000;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("audit log viewer: events, server filter, detail drawer, export", async ({ page }) => {
  await login(page); // the login itself writes an auth.login audit-log row for u1
  await page.goto("/logs");

  await expect(page.getByRole("heading", { name: "Audit loglar" })).toBeVisible({ timeout: COMPILE });
  await expect(page.getByText("auth.login").first()).toBeVisible({ timeout: COMPILE });

  // Admin-only actor filter + CSV export link.
  await expect(page.getByLabel("Foydalanuvchi", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Eksport/ })).toHaveAttribute(
    "href",
    /\/api\/logs\/export/,
  );

  // Category chip is server-driven (round-trips, keeps the auth rows).
  await page.getByRole("button", { name: /Login ·/ }).click();
  await expect(page.getByText("auth.login").first()).toBeVisible();

  // Row → detail drawer.
  await page.getByText("auth.login").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Hodisa tafsiloti")).toBeVisible();
});
