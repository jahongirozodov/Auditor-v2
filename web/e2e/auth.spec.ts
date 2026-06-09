import { test, expect } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";

test.describe("auth", () => {
  test("unauthenticated /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Tizimga kirish" })).toBeVisible();
  });

  test("valid credentials sign in and reach the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
    await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /Kirish/ }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: /Yaxshi kun/ })).toBeVisible();
  });

  test("invalid credentials show an error and stay on /login", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
    await page.getByLabel("Parol", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: /Kirish/ }).click();
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("authenticated shell renders chrome and signs out", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
    await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
    await page.getByRole("button", { name: /Kirish/ }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    // chrome present (sidebar nav + brand)
    await expect(page.getByRole("link", { name: /Auditlar/ })).toBeVisible();
    await expect(page.getByText("Auditor")).toBeVisible();

    // sign out via the user menu
    await page.getByRole("button", { name: /Akmal/ }).click();
    await page.getByRole("menuitem", { name: /Tizimdan chiqish/ }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
