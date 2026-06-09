import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super (canViewAll → full leaderboard)
const DEMO_PASSWORD = "Auditor!2026";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("kpi", () => {
  // Read-only: /kpi reads the seeded KpiUser/KpiRule rows, mutates nothing → no cleanup.
  test("leaderboard page renders rows and the rules card", async ({ page }) => {
    await login(page);
    await page.goto("/kpi");

    await expect(page.getByRole("heading", { name: "KPI reytingi" })).toBeVisible();
    await expect(page.getByText("Mutaxassislar reytingi")).toBeVisible();
    await expect(page.getByText("KPI qoidalari")).toBeVisible();

    // Leaderboard has at least one specialist row (super sees the full list).
    const rows = page.locator("table.tbl tbody tr");
    await expect(rows.first()).toBeVisible();
    expect(await rows.count()).toBeGreaterThan(0);

    // Own-only banner is hidden for a super (canViewAll).
    await expect(page.getByText("Faqat oʻz reytingingiz koʻrsatilmoqda")).toHaveCount(0);
  });

  test("sidebar opens the KPI screen", async ({ page }) => {
    await login(page);
    await page.locator("aside.sidebar").getByRole("link", { name: /KPI/ }).click();
    await expect(page).toHaveURL(/\/kpi$/);
    await expect(page.getByRole("heading", { name: "KPI reytingi" })).toBeVisible();
  });
});
