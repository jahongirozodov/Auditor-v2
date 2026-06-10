import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super (canActAt every stage)
const DEMO_PASSWORD = "Auditor!2026";
const FLOW_TITLE = "E2E approval oqimi hisoboti";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

// Remove anything this spec created so seeded snapshots elsewhere stay net-zero.
async function cleanup() {
  const prisma = new PrismaClient();
  try {
    const made = await prisma.report.findMany({
      where: { title: FLOW_TITLE },
      select: { id: true },
    });
    for (const r of made) {
      await prisma.approvalEvent.deleteMany({
        where: { entityType: "report", entityId: r.id },
      });
      await prisma.auditLog.deleteMany({ where: { entity: r.id } });
    }
    await prisma.report.deleteMany({ where: { title: FLOW_TITLE } });
  } finally {
    await prisma.$disconnect();
  }
}

test.describe.serial("reports", () => {
  test.afterAll(cleanup);

  test("generate → submit → approve through every stage → approved", async ({ page }) => {
    await login(page);
    await page.goto("/reports");

    // Generate a draft via the modal.
    await page.getByRole("button", { name: "Hisobot generatsiya" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Sarlavha").fill(FLOW_TITLE);
    await dialog.getByRole("button", { name: "Hisobot generatsiya" }).click();

    const card = page.locator(".card", { hasText: FLOW_TITLE });
    await expect(card).toBeVisible();
    await expect(card.getByText("Qoralama")).toBeVisible();

    // Author submits → review.
    await card.getByRole("button", { name: "Yuborish" }).click();
    await expect(card.getByText("Tekshiruvda")).toBeVisible();

    // super approves group_lead → head → dept → approved (3 steps).
    for (let i = 0; i < 3; i++) {
      const approve = card.getByRole("button", { name: "Tasdiqlash" });
      await expect(approve).toBeEnabled();
      await approve.click();
      if (i < 2) await expect(approve).toBeEnabled();
    }
    await expect(card.getByText("Tasdiqlangan")).toBeVisible();
  });
});

test.describe("report print view", () => {
  test("renders the isolated print layout", async ({ page }) => {
    await login(page);
    // R-201 — a seeded draft for AUD-2026-014 (deterministic, summary not yet generated).
    await page.goto("/print/reports/R-201");
    await expect(
      page.getByRole("heading", {
        name: "Aloqa va kommunikatsiya vazirligi — yakuniy audit hisoboti",
      }),
    ).toBeVisible();
    await expect(page.getByText("Rahbariyat uchun xulosa")).toBeVisible();
    await expect(page).toHaveScreenshot("report-print.png", { fullPage: true });
  });
});
