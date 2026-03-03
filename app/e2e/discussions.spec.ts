import { test, expect } from "@playwright/test";

test.describe("Discussions", () => {
  test("discussions page loads", async ({ page }) => {
    await page.goto("/discussions");
    await expect(page.getByRole("heading", { name: /discussions/i })).toBeVisible();
  });

  test("discussions page shows thread list or empty state", async ({ page }) => {
    await page.goto("/discussions");
    const listOrEmpty = page.getByText(/loading|no threads|ask questions|start the discussion/i).or(
      page.locator("[data-testid='thread-list'], a[href*='/discussions/']")
    );
    await expect(listOrEmpty.first()).toBeVisible({ timeout: 15_000 });
  });
});
