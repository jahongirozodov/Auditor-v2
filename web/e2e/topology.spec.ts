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

test("network topology renders a data-built graph or the empty state", async ({ page }) => {
  await login(page);
  await page.goto("/analysis/topology");
  await expect(page.getByRole("heading", { name: "Tarmoq topologiyasi" })).toBeVisible({
    timeout: COMPILE,
  });

  // The graph is now built from real backend data (findings/devices/traffic). Seeded
  // findings yield nodes for the default audit; with none, the real empty state shows.
  const svg = page.locator("svg.topo-svg");
  const empty = page.getByText("Topologiya uchun maʼlumot yoʻq");
  await expect(svg.or(empty).first()).toBeVisible({ timeout: COMPILE });
});
