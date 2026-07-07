import { expect, test } from "@playwright/test";

test("timer shell is visible", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("9時間タイマー")).toBeVisible();
  await expect(page.getByLabel("TODOリスト")).toBeVisible();
  await expect(page.getByRole("button", { name: "START" })).toBeVisible();
});
