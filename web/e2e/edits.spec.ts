import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super (canActAt group_lead)
const DEMO_PASSWORD = "Auditor!2026";
const AUDIT = "AUD-2026-009"; // status "returned" → project content editable
const NEW_GOAL = "E2E tahrirlangan audit maqsadi";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

let saved: {
  goal: string | null;
  methodology: string | null;
  scope: string[];
  tools: string[];
} | null = null;

test.describe.serial("edit project", () => {
  // Capture the audit's project content; restore it in afterAll for net-zero.
  test.beforeAll(async () => {
    const prisma = new PrismaClient();
    try {
      saved = await prisma.audit.findUnique({
        where: { id: AUDIT },
        select: { goal: true, methodology: true, scope: true, tools: true },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  test.afterAll(async () => {
    if (!saved) return;
    const prisma = new PrismaClient();
    try {
      await prisma.audit.update({ where: { id: AUDIT }, data: saved });
    } finally {
      await prisma.$disconnect();
    }
  });

  test("group lead edits the project goal and it persists", async ({ page }) => {
    await login(page);
    await page.goto(`/audits/${AUDIT}`);

    await page.getByRole("tab", { name: /Audit loyihasi/ }).click();
    await page.getByRole("button", { name: /Loyihani tahrirlash/ }).click();
    await page.locator("#ep-goal").fill(NEW_GOAL);
    await page.getByRole("button", { name: "Saqlash" }).click();

    // Server Action auto-refresh re-reads the DB → the Project tab shows the new goal.
    await expect(page.getByText(NEW_GOAL)).toBeVisible();
  });
});
