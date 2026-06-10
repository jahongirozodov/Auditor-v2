import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";
const U6_EMAIL = "m.sodiqova@gov.uz";

async function login(page: Page, email = DEMO_EMAIL) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(email);
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

  test("organization audit row opens audit detail", async ({ page }) => {
    await login(page);
    await page.goto("/organizations/o2");
    await page.getByRole("link", { name: /DBMS va loyiha auditi/ }).click();
    await expect(page).toHaveURL(/\/audits\/AUD-2026-013$/);
    await expect(page.getByRole("heading", { name: /DBMS va loyiha auditi/ })).toBeVisible();
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
    await login(page, U6_EMAIL);
    await page.goto("/tasks");
    await page.getByRole("link", { name: /Firewall qoidalari/ }).click();
    await expect(page).toHaveURL(/\/tasks\/T-114$/);
    await expect(page.getByRole("heading", { name: /Firewall qoidalari/ })).toBeVisible();
  });

  test("task assignment table title opens task detail", async ({ page }) => {
    await login(page);
    await page.goto("/tasks/assign");
    await page.getByRole("link", { name: /Firewall qoidalari/ }).click();
    await expect(page).toHaveURL(/\/tasks\/T-114$/);
    await expect(page.getByRole("heading", { name: /Firewall qoidalari/ })).toBeVisible();
  });

  test("audit task table title opens task detail", async ({ page }) => {
    await login(page);
    await page.goto("/audits/AUD-2026-014");
    await page.getByRole("tab", { name: /Vazifalar/ }).click();
    await page.getByRole("link", { name: /Web ilova OWASP ZAP/ }).click();
    await expect(page).toHaveURL(/\/tasks\/T-123$/);
    await expect(page.getByRole("heading", { name: /Web ilova OWASP ZAP/ })).toBeVisible();
  });

  test("my tasks only shows tasks assigned to the signed-in user", async ({ page }) => {
    await login(page);
    await page.goto("/tasks");
    await expect(page.getByText("Vazifa yoʻq")).toBeVisible();
    await expect(page.getByRole("link", { name: /Firewall qoidalari/ })).toHaveCount(0);
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
