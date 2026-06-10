import { test, expect, type Page } from "@playwright/test";

const DEMO_EMAIL = "a.yoldoshev@gov.uz";
const DEMO_PASSWORD = "Auditor!2026";
const COMPILE = 25_000;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Login (domen hisobi)").fill(DEMO_EMAIL);
  await page.getByLabel("Parol", { exact: true }).fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: /Kirish/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("AI report builder: chat round-trip (graceful when Ollama is down)", async ({ page }) => {
  await login(page);
  await page.goto("/ai");
  await expect(page.getByRole("heading", { name: "AI tahlil va hisobot quruvchi" })).toBeVisible({
    timeout: COMPILE,
  });
  // Report builder + a prompt preset are present.
  await expect(page.getByText("Hisobot quruvchi", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /Executive summary tayyorla/ })).toBeVisible();

  // Send a preset → the proxy answers (real text, or the graceful "unreachable" notice).
  await page.getByRole("button", { name: /Executive summary tayyorla/ }).click();
  await expect(page.getByText("Ollama AI").first()).toBeVisible({ timeout: COMPILE });
});
