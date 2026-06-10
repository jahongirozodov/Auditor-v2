import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz"; // u1 — super
const DEMO_PASSWORD = "Auditor!2026";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("profile", () => {
  test("opens from the user menu and walks the tabs", async ({ page }) => {
    await login(page);
    await page.goto("/profile");

    await expect(page.getByRole("heading", { name: "Mening profilim" })).toBeVisible();
    // Overview (default) — KPI dynamics panel.
    await expect(page.getByText("KPI dinamikasi")).toBeVisible();

    // Activity tab — real audit-log timeline.
    await page.getByRole("tab", { name: /Faollik/ }).click();
    await expect(page.getByText("Faollik tarixi")).toBeVisible();

    // Sessions — current session + my tokens.
    await page.getByRole("tab", { name: /Sessiyalar/ }).click();
    await expect(page.getByText("Aktiv sessiyalar")).toBeVisible();

    // Settings — personal info form.
    await page.getByRole("tab", { name: /Sozlamalar/ }).click();
    await expect(page.getByText("Shaxsiy maʼlumotlar")).toBeVisible();
  });

  test("password change validates a confirm mismatch (no mutation)", async ({ page }) => {
    await login(page);
    await page.goto("/profile");
    await page.getByRole("tab", { name: /Xavfsizlik/ }).click();

    await page.getByLabel("Joriy parol").fill("whatever1");
    await page.getByLabel("Yangi parol", { exact: true }).fill("newpass123");
    await page.getByLabel("Tasdiqlash").fill("different123");
    await page.getByRole("button", { name: "Parolni yangilash" }).click();

    await expect(page.getByText("Yangi parol va tasdiqlash mos kelmadi")).toBeVisible();
  });

  test("overview content snapshot", async ({ page }) => {
    await login(page);
    await page.goto("/profile");
    await expect(page.getByText("KPI dinamikasi")).toBeVisible();
    // Snapshot the overview grid (excludes the hero, whose last-login is time-sensitive).
    await expect(page.locator(".route-anim > .grid").first()).toHaveScreenshot(
      "profile-overview.png",
    );
  });
});
