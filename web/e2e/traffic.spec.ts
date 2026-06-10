import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super (traffic.upload permission)
const DEMO_PASSWORD = "Auditor!2026";
const SAMPLE = "e2e/fixtures/traffic-eve.json";
const COMPILE = 25_000;
const AI = 120_000;
// Opt-in: traffic AI is a hard dependency on a live Ollama. Skipped by default so CI stays green.
const RUN_AI = Boolean(process.env.RUN_AI_E2E);

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function clearTrafficUploads() {
  const prisma = new PrismaClient();
  try {
    await prisma.trafficUpload.deleteMany({});
  } finally {
    await prisma.$disconnect();
  }
}

test.describe.serial("traffic analysis", () => {
  test.beforeAll(clearTrafficUploads);
  test.afterAll(clearTrafficUploads);

  test("renders the screen (empty) with tabs + snapshot", async ({ page }) => {
    await login(page);
    await page.goto("/analysis/traffic");
    await expect(page.getByRole("heading", { name: "Trafik tahlili" })).toBeVisible({
      timeout: COMPILE,
    });
    await expect(page.getByRole("tab")).toHaveCount(3);
    await expect(page.getByText("Hali trafik fayli yuklanmagan.")).toBeVisible();
    await expect(page).toHaveScreenshot("traffic-empty.png", { fullPage: true });
  });

  test("upload → AI analyze → AI panel → create drafts", async ({ page }) => {
    test.skip(!RUN_AI, "needs a live Ollama model (set RUN_AI_E2E=1)");
    test.setTimeout(AI + 60_000);
    await login(page);
    await page.goto("/analysis/traffic");
    await expect(page.getByRole("heading", { name: "Trafik tahlili" })).toBeVisible({ timeout: COMPILE });

    await page.locator('input[type="file"]').setInputFiles(SAMPLE);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: COMPILE });
    await dialog.locator("#trf-audit").selectOption("AUD-2026-014");
    await dialog.getByRole("button", { name: /Tahlil qilish/ }).click();

    // AI structured analysis appears (hard dependency — needs the model).
    await expect(page.getByText("Umumiy xavf")).toBeVisible({ timeout: AI });
    await page.getByRole("button", { name: /finding yaratish/ }).click();
    await expect(page.getByText(/finding qoralama yaratildi/)).toBeVisible({ timeout: COMPILE });
  });
});
