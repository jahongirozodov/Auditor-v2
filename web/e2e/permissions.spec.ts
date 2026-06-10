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

test("permissions matrix renders and toggles edit mode (super)", async ({ page }) => {
  await login(page);
  await page.goto("/permissions");
  await expect(page.getByRole("heading", { name: "Rollar va ruxsatlar matritsasi" })).toBeVisible({
    timeout: COMPILE,
  });
  await expect(page.locator("table.matrix")).toBeVisible();
  await expect(page.getByRole("rowheader", { name: "Foydalanuvchilar" })).toBeVisible();

  await page.getByRole("button", { name: /Tahrir rejimi/ }).click();
  await expect(page.getByText("Tahrir rejimi yoqilgan")).toBeVisible();
});
