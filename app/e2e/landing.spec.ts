import { test, expect } from "@playwright/test";

test.describe("Landing", () => {
  test("homepage loads and shows hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Solana Development" })).toBeVisible();
  });

  test("navigating to courses from landing shows connect wallet when not connected", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /get started|courses|browse/i }).first().click();
    await expect(page).toHaveURL(/\/courses/);
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
  });
});
