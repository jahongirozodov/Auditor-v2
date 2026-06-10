import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";
const SAMPLE = "e2e/fixtures/scan-sample.csv";
const COMPILE = 25_000;
// uploadScannerFile runs the AI normalization server-side (graceful). A live model
// makes it slower; an absent one fails fast (ECONNREFUSED) and the import still lands.
const IMPORT = 120_000;
const RUN_AI = Boolean(process.env.RUN_AI_E2E);

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("scanner import", () => {
  test("upload → import (parsed) + optional AI normalization", async ({ page }) => {
    test.setTimeout(IMPORT + 60_000);
    await login(page);
    await page.goto("/analysis/scanner");
    await expect(page.getByRole("heading", { name: "Skaner importi" })).toBeVisible({
      timeout: COMPILE,
    });

    await page.locator('input[type="file"]').setInputFiles(SAMPLE);

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: COMPILE });
    await dialog.locator("#scn-audit").selectOption("AUD-2026-014");
    await dialog.getByRole("button", { name: /Import qilish/ }).click();

    // Deterministic: the import lands (recent table row) regardless of the model.
    await expect(page.getByText("scan-sample.csv").first()).toBeVisible({ timeout: IMPORT });

    if (RUN_AI) {
      // The AI normalization panel shows the original→normalized dedup line.
      await expect(page.getByText(/normallashtirilgan/)).toBeVisible({ timeout: IMPORT });
    }
  });

  test("sibling tabs navigate without 404", async ({ page }) => {
    await login(page);
    await page.goto("/analysis/scanner");
    await page.getByRole("tab", { name: /Konfiguratsiya/ }).click();
    await expect(page).toHaveURL(/\/analysis\/config$/, { timeout: COMPILE });
  });
});
