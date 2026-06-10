import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super (canManage audit → may add evidence)
const DEMO_PASSWORD = "Auditor!2026";
const AUDIT = "AUD-2026-014";
const TEST_FILE = "e2e-evidence.txt";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

async function cleanup() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.auditEvidence.findMany({
      where: { file: { filename: TEST_FILE } },
      select: { id: true, fileId: true },
    });
    for (const r of rows) {
      await prisma.auditEvidence.delete({ where: { id: r.id } });
      await prisma.fileStorage.delete({ where: { id: r.fileId } }).catch(() => {});
    }
  } finally {
    await prisma.$disconnect();
  }
}

test.describe.serial("audit evidence", () => {
  test.afterAll(cleanup);

  async function openFilesTab(page: Page) {
    await login(page);
    await page.goto(`/audits/${AUDIT}`);
    await page.getByRole("tab", { name: /Fayllar & dalillar/ }).click();
  }

  test("empty evidence tab snapshot", async ({ page }) => {
    await openFilesTab(page);
    await expect(page.getByText("Hali dalil yuklanmagan.")).toBeVisible();
    await expect(page.locator(".route-anim .panel").last()).toHaveScreenshot("evidence-empty.png");
  });

  test("member uploads evidence with a mandatory comment", async ({ page }) => {
    await openFilesTab(page);
    await page.getByRole("button", { name: "Dalil qoʻshish" }).click();

    await page.locator("#ev-file").setInputFiles({
      name: TEST_FILE,
      mimeType: "text/plain",
      buffer: Buffer.from("e2e evidence body"),
    });
    await page.locator("#ev-comment").fill("E2E test dalili");
    await page.getByRole("dialog").getByRole("button", { name: "Dalil qoʻshish" }).click();

    await expect(page.getByText(TEST_FILE)).toBeVisible();
    await expect(page.getByText("E2E test dalili")).toBeVisible();
    await expect(page.getByRole("link", { name: /Yuklab olish/ }).first()).toBeVisible();
  });
});
