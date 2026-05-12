import { expect, test } from "@playwright/test";

test("command center runs the agent payment demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("AgentMeter")).toBeVisible();
  await page.getByRole("button", { name: /Run Agent Payment Demo/i }).first().click();
  await expect(page.getByText(/Completed:/i)).toBeVisible();
});

test("endpoints page exposes seeded routes", async ({ page }) => {
  await page.goto("/endpoints");
  await expect(page.getByText("Weather Alpha")).toBeVisible();
  await expect(page.getByText("/gateway/weather-alpha")).toBeVisible();
});
