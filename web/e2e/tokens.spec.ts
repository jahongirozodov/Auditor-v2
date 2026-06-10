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

test("audit tokens table + issue modal (super)", async ({ page }) => {
  await login(page);
  await page.goto("/tokens");
  await expect(page.getByRole("heading", { name: "Audit tokenlar boshqaruvi" })).toBeVisible({
    timeout: COMPILE,
  });
  await expect(page.locator("table.tbl")).toBeVisible();
  await expect(page.getByText("ms-laptop")).toBeVisible(); // a device row
  await expect(page.getByText("Aktiv").first()).toBeVisible(); // an active status badge

  // Open the issue-token modal (read-only — cancel without persisting).
  await page
    .getByRole("button", { name: /Token chiqarish/ })
    .first()
    .click();
  await expect(page.getByText("Yangi audit token")).toBeVisible();
});
