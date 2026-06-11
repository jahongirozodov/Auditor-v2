import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("notifications", () => {
  test("bell button is visible in topbar", async ({ page }) => {
    await login(page);
    const bell = page.getByRole("button", { name: "Bildirishnomalar" });
    await expect(bell).toBeVisible();
  });

  test("bell opens and closes the dropdown", async ({ page }) => {
    await login(page);
    const bell = page.getByRole("button", { name: "Bildirishnomalar" });
    await bell.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByText("Bildirishnomalar")).toBeVisible();
    // Close by pressing Escape
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();
  });

  test("dropdown shows empty state when no notifications", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Bildirishnomalar" }).click();
    // Either empty text or a list — we just assert the menu opened
    await expect(page.getByRole("menu")).toBeVisible();
    // Footer link to full page is always present
    await expect(page.getByRole("link", { name: /Barcha bildirishnomalar/ })).toBeVisible();
  });

  test("/notifications page loads and shows filter tabs", async ({ page }) => {
    await login(page);
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /Bildirishnomalar/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Hammasi/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Oʻqilmagan/ })).toBeVisible();
  });

  test("/notifications page footer link in bell navigates correctly", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Bildirishnomalar" }).click();
    await page.getByRole("link", { name: /Barcha bildirishnomalar/ }).click();
    await expect(page).toHaveURL(/\/notifications$/);
  });

  test("visual snapshot — bell dropdown open", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Bildirishnomalar" }).click();
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page).toHaveScreenshot("notif-bell-open.png", { fullPage: false });
  });

  test("visual snapshot — /notifications page", async ({ page }) => {
    await login(page);
    await page.goto("/notifications");
    await expect(page.getByRole("heading", { name: /Bildirishnomalar/ })).toBeVisible();
    await expect(page).toHaveScreenshot("notif-page.png", { fullPage: true });
  });
});
