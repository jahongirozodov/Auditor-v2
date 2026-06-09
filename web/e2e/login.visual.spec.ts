import { test, expect } from "@playwright/test";

test("login screen visual snapshot", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Tizimga kirish" })).toBeVisible();
  await expect(page).toHaveScreenshot("login.png", { fullPage: true });
});
