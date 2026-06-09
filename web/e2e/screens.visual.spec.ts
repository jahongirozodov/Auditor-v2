import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

const SCREENS: { path: string; heading: string; file: string }[] = [
  { path: "/organizations", heading: "Tashkilotlar", file: "organizations.png" },
  { path: "/audits", heading: "Auditlar", file: "audits.png" },
  { path: "/tasks", heading: "Mening vazifalarim", file: "tasks.png" },
  { path: "/findings", heading: "Findinglar", file: "findings.png" },
  {
    path: "/audits/AUD-2026-014",
    heading: "Aloqa va kommunikatsiya vazirligi — yillik kompleks audit",
    file: "audit-detail.png",
  },
  {
    path: "/tasks/T-114",
    heading: "Firewall qoidalari va segmentatsiyani tahlil qilish",
    file: "task-detail.png",
  },
  { path: "/analysis/config", heading: "Konfiguratsiya tahlili", file: "config.png" },
];

test.describe("screens visual", () => {
  for (const s of SCREENS) {
    test(`${s.path} snapshot`, async ({ page }) => {
      await login(page);
      await page.goto(s.path);
      await expect(page.getByRole("heading", { name: s.heading })).toBeVisible();
      await expect(page).toHaveScreenshot(s.file, { fullPage: true });
    });
  }
});
