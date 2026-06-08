import { test, expect } from "@playwright/test";

test.describe("home (foundation page)", () => {
  test("renders the localized title and theme toggle", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Auditor — ishlab chiqish muhiti tayyor/ }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /Mavzuni almashtirish/ })).toBeVisible();
  });

  test("default theme is dark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("theme toggle flips to light", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Mavzuni almashtirish/ }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });
});
