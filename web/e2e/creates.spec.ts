import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super
const DEMO_PASSWORD = "Auditor!2026";
const NEW_ID = "AUD-2026-016"; // deterministic: seed max is AUD-2026-015
const NEW_AUDIT_LEADER = "u3"; // createAudit credits the leader with act_as_group_lead + audit_participation

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

let savedLeaderKpi: {
  audits: number;
  tasks: number;
  findings: number;
  total: number;
  delta: number;
  sparkline: unknown;
} | null = null;

test.describe.serial("creates", () => {
  // Capture the leader's KPI row: createAudit increments it (+act_as_group_lead +audit_participation,
  // +1 audits) → restore the original in afterAll so the leaderboard/dashboard snapshots stay net-zero.
  test.beforeAll(async () => {
    const prisma = new PrismaClient();
    try {
      const k = await prisma.kpiUser.findUnique({ where: { userId: NEW_AUDIT_LEADER } });
      savedLeaderKpi = k
        ? {
            audits: k.audits,
            tasks: k.tasks,
            findings: k.findings,
            total: k.total,
            delta: k.delta,
            sparkline: k.sparkline,
          }
        : null;
    } finally {
      await prisma.$disconnect();
    }
  });

  // Scoped to this group (NOT file-level): with fullyParallel + workers:2 the file's three
  // serial groups split across both workers, and a file-level afterAll runs once per worker —
  // so the worker finishing another group would delete NEW_ID while this group's second test is
  // still reading it. Keep cleanup here so only this worker removes the audit, after both tests.
  test.afterAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.kpiEvent.deleteMany({ where: { auditId: NEW_ID } });
      if (savedLeaderKpi) {
        await prisma.kpiUser.update({
          where: { userId: NEW_AUDIT_LEADER },
          data: {
            ...savedLeaderKpi,
            sparkline: JSON.parse(JSON.stringify(savedLeaderKpi.sparkline)),
          },
        });
      }
      await prisma.approvalEvent.deleteMany({ where: { entityId: NEW_ID } });
      await prisma.auditLog.deleteMany({ where: { entity: NEW_ID } });
      await prisma.auditMember.deleteMany({ where: { auditId: NEW_ID } });
      await prisma.audit.deleteMany({ where: { id: NEW_ID } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test("create audit → form team → start project draft → submit", async ({ page }) => {
    await login(page);
    await page.goto("/audits");

    // Open the create modal + fill the required fields.
    await page.getByRole("button", { name: /Yangi audit/ }).click();
    await page.getByLabel("Audit nomi").fill("E2E sinov auditi");
    await page.getByLabel("Tashkilot").selectOption("o1");
    await page.getByLabel("Boshlanishi").fill("2026-06-01");
    await page.getByLabel("Tugashi").fill("2026-07-01");
    await page.getByLabel("Audit guruhi rahbari").selectOption("u3");
    await page.getByRole("button", { name: "Yaratish" }).click();

    // Lands on the new audit (group_forming).
    await expect(page).toHaveURL(new RegExp(`/audits/${NEW_ID}$`));
    await expect(page.getByRole("heading", { name: "E2E sinov auditi" })).toBeVisible();

    // Group tab: start-draft CTA is present (proves group_forming) → start the draft.
    await page.getByRole("tab", { name: /Audit guruhi/ }).click();
    await page.getByRole("button", { name: /Loyiha qoralamasini boshlash/ }).click();
    await expect(page.getByRole("button", { name: /Loyiha qoralamasini boshlash/ })).toHaveCount(0);

    // Project tab: draft → submit → project_pending (awaiting head).
    await page.getByRole("tab", { name: /Audit loyihasi/ }).click();
    const apf = page.locator(".apf");
    await expect(apf.getByText("Qoralama")).toBeVisible();
    await apf.getByRole("button", { name: "Tasdiqqa yuborish" }).click();
    await expect(apf.getByText("Jarayonda")).toBeVisible();
  });

  test("a created audit appears in the DB-backed list", async ({ page }) => {
    await login(page);
    // Re-navigate once if a cold /audits compile under parallel load misses the default window.
    await expect(async () => {
      await page.goto("/audits");
      await expect(page.getByRole("link", { name: "E2E sinov auditi" })).toBeVisible({
        timeout: 5_000,
      });
    }).toPass({ timeout: 20_000 });
  });
});

const TASK_ID = "T-126"; // deterministic: seed max is T-125
const TASK_AUDIT = "AUD-2026-014"; // in_progress, members [u3,u4,u6,u7]
let savedAgg: unknown = null;

test.describe.serial("create task", () => {
  // Capture the audit's denormalized tasksAgg so afterAll can restore it exactly (createTask
  // recomputes it from real rows → net-zero requires restoring the original, not a recount).
  test.beforeAll(async () => {
    const prisma = new PrismaClient();
    try {
      const a = await prisma.audit.findUnique({
        where: { id: TASK_AUDIT },
        select: { tasksAgg: true },
      });
      savedAgg = a?.tasksAgg ?? null;
    } finally {
      await prisma.$disconnect();
    }
  });

  test.afterAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.taskStatusHistory.deleteMany({ where: { taskId: TASK_ID } });
      await prisma.auditLog.deleteMany({ where: { entity: TASK_ID } });
      await prisma.task.deleteMany({ where: { id: TASK_ID } });
      if (savedAgg) {
        await prisma.audit.update({
          where: { id: TASK_AUDIT },
          data: { tasksAgg: JSON.parse(JSON.stringify(savedAgg)) },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  test("create + assign a task → it appears in the DB-backed assign table", async ({ page }) => {
    await login(page);
    await page.goto("/tasks/assign");
    await page.getByLabel("Audit:").selectOption(TASK_AUDIT);

    // Open the create modal + fill the required fields (type/priority keep defaults).
    await page.getByRole("button", { name: /Yangi vazifa/ }).click();
    await page.locator("#ct-title").fill("E2E sinov vazifasi");
    await page.locator("#ct-due").fill("2026-06-15");
    await page.locator("#ct-assignee").selectOption("u6");
    await page.getByRole("button", { name: "Yaratish va biriktirish" }).click();

    // The new T-126 row shows up (status "Tayinlangan" = assigned).
    await expect(page.getByRole("link", { name: TASK_ID })).toBeVisible();
    const row = page.getByRole("row", { name: new RegExp(TASK_ID) });
    await expect(row.getByText("Tayinlangan")).toBeVisible();
  });
});

const FINDING_ID = "F-2026-0351"; // deterministic in 2026: seed max is F-2026-0350
const FINDING_AUDIT = "AUD-2026-014"; // owns T-114
let savedFindings: unknown = null;

test.describe.serial("create finding", () => {
  // Capture the audit's denormalized severity counts; createFinding recomputes them → restore
  // the captured value in afterAll for net-zero (keeps the findings/audit-detail snapshots stable).
  test.beforeAll(async () => {
    const prisma = new PrismaClient();
    try {
      const a = await prisma.audit.findUnique({
        where: { id: FINDING_AUDIT },
        select: { findings: true },
      });
      savedFindings = a?.findings ?? null;
    } finally {
      await prisma.$disconnect();
    }
  });

  test.afterAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.auditLog.deleteMany({ where: { entity: FINDING_ID } });
      await prisma.finding.deleteMany({ where: { id: FINDING_ID } });
      if (savedFindings) {
        await prisma.audit.update({
          where: { id: FINDING_AUDIT },
          data: { findings: JSON.parse(JSON.stringify(savedFindings)) },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  test("file a finding → it appears in the DB-backed findings list", async ({ page }) => {
    await login(page);
    await page.goto("/findings");

    // Open the create modal + fill required fields (low severity → row sorts last by id).
    await page.getByRole("button", { name: /Topilma/ }).click();
    await page.locator("#cf-title").fill("E2E sinov topilmasi");
    await page.locator("#cf-audit").selectOption(FINDING_AUDIT);
    await page.locator("#cf-task").selectOption("T-114");
    await page.locator("#cf-severity").selectOption("low");
    await page.getByRole("button", { name: "Yaratish" }).click();

    // The new finding appears (id rendered as text under the title).
    await expect(page.getByText("E2E sinov topilmasi")).toBeVisible();
    await expect(page.getByText(FINDING_ID)).toBeVisible();
  });
});
