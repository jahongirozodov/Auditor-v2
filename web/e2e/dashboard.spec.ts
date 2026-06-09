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

test.describe("dashboard", () => {
  test("renders the key panels", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: /Yaxshi kun/ })).toBeVisible();
    await expect(page.getByText("Faol auditlar").first()).toBeVisible();
    await expect(page.getByText("Top mutaxassislar — KPI")).toBeVisible();
    await expect(page.getByText("Xavf darajalari boʻyicha")).toBeVisible();
  });

  test("visual snapshot", async ({ page }) => {
    await login(page);
    await expect(page.getByRole("heading", { name: /Yaxshi kun/ })).toBeVisible();
    await expect(page).toHaveScreenshot("dashboard.png", { fullPage: true });
  });
});
