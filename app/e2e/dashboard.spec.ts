import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard route requires wallet and shows connect prompt", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
  });
});
