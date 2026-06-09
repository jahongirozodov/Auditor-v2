import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";
const FINDING = "AD parol siyosati — minimum 6 belgi, history off"; // F-2026-0342 (review)

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

// Serial + net-zero: each test reverts to the seeded state so the shared DB stays
// pristine for the visual-snapshot specs. Server Actions auto-refresh the RSC tree
// (which re-reads the DB), so asserting the updated UI proves persistence — no reload.
test.describe.serial("mutations", () => {
  test("task lifecycle persists and round-trips back", async ({ page }) => {
    await login(page);
    await page.goto("/tasks/T-114");
    await expect(page.getByText(/T-114 · Jarayonda/)).toBeVisible();

    // submit → review
    await page.getByRole("button", { name: "Tekshiruvga yuborish" }).click();
    await expect(page.getByText(/T-114 · Tekshiruvda/)).toBeVisible();

    // return (with comment) → returned
    await page.getByRole("button", { name: "Qaytarish" }).click();
    await page.getByLabel("Qaytarish sababi").fill("Qayta koʻrib chiqilsin");
    await page.getByRole("button", { name: "Yuborish" }).click();
    await expect(page.getByText(/T-114 · Qaytarilgan/)).toBeVisible();

    // restart → in_progress (restore seed)
    await page.getByRole("button", { name: "Qayta boshlash" }).click();
    await expect(page.getByText(/T-114 · Jarayonda/)).toBeVisible();
  });

  test("finding approval return → resubmit round-trips", async ({ page }) => {
    await login(page);
    await page.goto("/findings");
    await page.getByText(FINDING).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Jarayonda")).toBeVisible(); // review (in-progress chip)

    // reject with comment → returned
    await dialog.getByRole("button", { name: "Qaytarish" }).click();
    await dialog.getByLabel("Qaytarish sababi").fill("Dalil yetarli emas");
    await dialog.getByRole("button", { name: "Yuborish" }).click();
    await expect(dialog.getByText("Qaytarilgan")).toBeVisible();

    // resubmit → review (restore seed)
    await dialog.getByRole("button", { name: "Qayta yuborish" }).click();
    await expect(dialog.getByText("Jarayonda")).toBeVisible();
  });

  test("project approval return → resubmit round-trips", async ({ page }) => {
    await login(page);
    await page.goto("/audits/AUD-2026-015");
    await page.getByRole("tab", { name: /Audit loyihasi/ }).click();
    const apf = page.locator(".apf");
    await expect(apf.getByText("Jarayonda")).toBeVisible(); // project_pending → head

    // reject with comment → returned
    await apf.getByRole("button", { name: "Qaytarish" }).click();
    await apf.getByLabel("Qaytarish sababi").fill("Doira aniqlashtirilsin");
    await apf.getByRole("button", { name: "Yuborish" }).click();
    await expect(apf.getByText("Qaytarilgan")).toBeVisible();

    // resubmit → project_pending/head (restore seed)
    await apf.getByRole("button", { name: "Qayta yuborish" }).click();
    await expect(apf.getByText("Jarayonda")).toBeVisible();
  });

  test("return requires a comment (send disabled until typed)", async ({ page }) => {
    await login(page);
    await page.goto("/findings");
    await page.getByText(FINDING).click();
    const dialog = page.getByRole("dialog");

    await dialog.getByRole("button", { name: "Qaytarish" }).click();
    const send = dialog.getByRole("button", { name: "Yuborish" });
    await expect(send).toBeDisabled();
    await dialog.getByLabel("Qaytarish sababi").fill("sabab");
    await expect(send).toBeEnabled();
    await dialog.getByRole("button", { name: "Bekor qilish" }).click(); // no mutation
  });
});
