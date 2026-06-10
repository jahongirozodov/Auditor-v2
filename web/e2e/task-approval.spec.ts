import { test, expect, type Page } from "@playwright/test";

const DEMO_PASSWORD = "Auditor!2026";
const LEADER_EMAIL = "b.mirzayev@gov.uz"; // u3, AUD-2026-014 leader
const ASSIGNEE_EMAIL = "s.karimova@gov.uz"; // u4, T-123 assignee

async function login(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(email);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test.describe("task approval visibility", () => {
  test("self-assigned review task hides approve and return", async ({ page }) => {
    await login(page, ASSIGNEE_EMAIL);
    await page.goto("/tasks/T-123");
    await expect(page.getByText(/T-123 .* Tekshiruvda/)).toBeVisible();
    await expect(page.getByRole("button", { name: /qullash/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Qaytarish" })).toHaveCount(0);
  });

  test("audit leader sees approve and return for another assignee", async ({ page }) => {
    await login(page, LEADER_EMAIL);
    await page.goto("/tasks/T-123");
    await expect(page.getByText(/T-123 .* Tekshiruvda/)).toBeVisible();
    await expect(page.getByRole("button", { name: /qullash/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Qaytarish" })).toBeVisible();
  });
});
