import { test, expect } from "@playwright/test";

test.describe("Courses", () => {
  test("courses route requires wallet and shows connect prompt", async ({
    page,
  }) => {
    await page.goto("/courses");
    await expect(page.getByText(/connect your wallet/i)).toBeVisible();
  });
});
