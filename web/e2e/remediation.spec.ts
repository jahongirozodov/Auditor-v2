import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import msg from "../messages/uz.json";

const F = msg.findings;
const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super (acts as a lead)
const DEMO_PASSWORD = "Auditor!2026";
const FINDING = "F-2026-0341"; // seeded "approved" finding (task T-114)

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe.serial("finding remediation", () => {
  // Remediation is one-way (approved → closed) — reset the finding + drop its events in afterAll.
  test.afterAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.approvalEvent.deleteMany({
        where: { entityType: "finding_remediation", entityId: FINDING },
      });
      await prisma.auditLog.deleteMany({ where: { entity: FINDING } });
      await prisma.finding.update({
        where: { id: FINDING },
        data: { status: "approved", approvalStage: null },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  test("drives an approved finding fixing → fixed → retest → closed", async ({ page }) => {
    await login(page);
    await page.goto("/findings");
    await page.getByText(FINDING).click();

    const d = page.getByRole("dialog");
    // approved → fixing → fixed → retest → closed, each status exposing the next action.
    await d.getByRole("button", { name: F.remStart }).click();
    await d.getByRole("button", { name: F.remMarkFixed }).click();
    await d.getByRole("button", { name: F.remStartRetest }).click();
    await d.getByRole("button", { name: F.remPass }).click();

    // closed → terminal, the pass button is gone.
    await expect(d.getByRole("button", { name: F.remPass })).toHaveCount(0);
  });
});
