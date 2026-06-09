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

test.describe("navigation", () => {
  test("sidebar opens each core screen", async ({ page }) => {
    await login(page);
    const sidebar = page.locator("aside.sidebar");

    await sidebar.getByRole("link", { name: /Tashkilotlar/ }).click();
    await expect(page).toHaveURL(/\/organizations$/);
    await expect(page.getByRole("heading", { name: "Tashkilotlar" })).toBeVisible();

    await sidebar.getByRole("link", { name: /Auditlar/ }).click();
    await expect(page).toHaveURL(/\/audits$/);
    await expect(page.getByRole("heading", { name: "Auditlar" })).toBeVisible();

    await sidebar.getByRole("link", { name: /Mening vazifalarim/ }).click();
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByRole("heading", { name: "Mening vazifalarim" })).toBeVisible();

    await sidebar.getByRole("link", { name: /Findinglar/ }).click();
    await expect(page).toHaveURL(/\/findings$/);
    await expect(page.getByRole("heading", { name: "Findinglar" })).toBeVisible();
  });

  test("organization list → detail", async ({ page }) => {
    await login(page);
    await page.goto("/organizations");
    await page.getByRole("link", { name: "Soliq qoʻmitasi", exact: true }).click();
    await expect(page).toHaveURL(/\/organizations\/o2$/);
    await expect(page.getByRole("heading", { name: "Soliq qoʻmitasi" })).toBeVisible();
  });

  test("finding row opens the drawer", async ({ page }) => {
    await login(page);
    await page.goto("/findings");
    await page.getByText("Login forma — SQL injection (POST /api/v1/login)").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("3-bosqichli tasdiqlash")).toBeVisible();
  });

  test("audit list → detail tabs", async ({ page }) => {
    await login(page);
    await page.goto("/audits");
    await page
      .getByRole("link", { name: "Aloqa va kommunikatsiya vazirligi — yillik kompleks audit" })
      .click();
    await expect(page).toHaveURL(/\/audits\/AUD-2026-014$/);
    await expect(page.getByText("Audit jarayoni — 10 bosqich")).toBeVisible();
    await page.getByRole("tab", { name: /Audit loyihasi/ }).click();
    await expect(page.getByText("3-bosqichli tasdiqlash")).toBeVisible();
  });

  test("task card → task detail", async ({ page }) => {
    await login(page);
    await page.goto("/tasks");
    await page.getByRole("link", { name: /Firewall qoidalari/ }).click();
    await expect(page).toHaveURL(/\/tasks\/T-114$/);
    await expect(page.getByRole("heading", { name: /Firewall qoidalari/ })).toBeVisible();
  });

  test("⌘K command palette navigates", async ({ page }) => {
    await login(page);
    const palette = page.getByRole("dialog", { name: "Qidiruv" });
    // AppShell's ⌘K listener attaches in a useEffect — retry the press until it's hydrated.
    // The handler toggles, so only press while the palette is closed (avoids toggling it back shut).
    await expect(async () => {
      if (!(await palette.isVisible())) await page.keyboard.press("Control+k");
      await expect(palette).toBeVisible({ timeout: 1_000 });
    }).toPass({ timeout: 15_000 });
    await page.getByRole("textbox").fill("Soliq");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/audits\/AUD-2026-013$/);
  });
});
