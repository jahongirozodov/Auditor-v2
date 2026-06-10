import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";
// Relative to the Playwright cwd (web/). setInputFiles resolves it for us.
const SAMPLE = "e2e/fixtures/fw-core-01.cfg";
// Dev-server first-compile of a fresh route can exceed the 10s default.
const COMPILE = 25_000;
// Config detection now runs the local model server-side — slow + non-deterministic.
const AI = 120_000;
// Opt-in: this flow needs a live Ollama (qwen3-coder). Skipped by default so CI stays green.
const RUN_AI = Boolean(process.env.RUN_AI_E2E);

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("configuration analysis", () => {
  test("upload → AI analyze → create draft findings", async ({ page }) => {
    test.skip(!RUN_AI, "needs a live Ollama model (set RUN_AI_E2E=1)");
    test.setTimeout(AI + 60_000);
    await login(page);
    await page.goto("/analysis/config");
    await expect(page.getByRole("heading", { name: "Konfiguratsiya tahlili" })).toBeVisible({
      timeout: COMPILE,
    });
    await expect(page.getByRole("tab")).toHaveCount(3);

    // Upload a Cisco ASA config (hidden input).
    await page.locator('input[type="file"]').setInputFiles(SAMPLE);

    // Target picker — attach to an audit that has tasks, then analyze.
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: COMPILE });
    await dialog.locator("#cfg-audit").selectOption("AUD-2026-014");
    await dialog.getByRole("button", { name: /Tahlil qilish/ }).click();

    // The AI analyzer detects gaps server-side; the result cards render (count varies).
    await expect(page.getByText("AI tahlil natijasi")).toBeVisible({ timeout: AI });
    await expect(page.getByText(/ta kamchilik aniqlandi/)).toBeVisible({ timeout: AI });

    // Materialize drafts → success toast.
    await page.getByRole("button", { name: /finding yaratish/ }).click();
    await expect(page.getByText(/qoralama yaratildi/)).toBeVisible({ timeout: COMPILE });
  });

  test("sibling tabs navigate without 404", async ({ page }) => {
    await login(page);
    await page.goto("/analysis/config");
    await expect(page.getByRole("heading", { name: "Konfiguratsiya tahlili" })).toBeVisible({
      timeout: COMPILE,
    });

    await page.getByRole("tab", { name: /Skaner importi/ }).click();
    await expect(page).toHaveURL(/\/analysis\/scanner$/, { timeout: COMPILE });
    await expect(page.getByRole("heading", { name: "Skaner importi" })).toBeVisible({
      timeout: COMPILE,
    });

    await page.goto("/analysis/config");
    await page.getByRole("tab", { name: /Trafik tahlili/ }).click();
    await expect(page).toHaveURL(/\/analysis\/traffic$/, { timeout: COMPILE });
    await expect(page.getByRole("heading", { name: "Trafik tahlili" })).toBeVisible({
      timeout: COMPILE,
    });
  });
});
