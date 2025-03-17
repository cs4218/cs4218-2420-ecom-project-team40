// @ts-check
const { test, expect } = require("@playwright/test");
const { skip } = require("node:test");

test.describe("Admin manage order flow", () => {
  test.beforeEach("Setup order", async ({ page }) => {
    // Login flow
    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("cs4218@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();

    // Navigate to dashboard flow
    await page.getByRole("button", { name: "CS 4218 Test Account" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // Check admin dashboard panel
    await expect(page.getByText("Admin Panel")).toBeVisible();

    // Navigate to orders page
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("All Orders")).toBeVisible();

    const orderCount = await page.getByText("Status").count();

    if (!orderCount) {
      skip(); // Skip if no order as below requires order to test
    }

    // Reset first order to not process yet
    await page.locator(".ant-select-selection-item").first().click();
    await page.locator(".ant-select-item").first().click();
    await page.reload(); // load the items again for selector to select based on appearance order
  });

  // Assumes that one order is in not process status
  test("Can navigate to order page and update status", async ({ page }) => {
    // Check orders page
    await expect(page.getByText("All Orders")).toBeVisible();
    await expect(page.getByRole("main")).toContainText("Status");
    await expect(page.getByRole("main")).toContainText("Buyer");
    await expect(page.getByRole("main")).toContainText("Date");
    await expect(page.getByRole("main")).toContainText("Payment");
    await expect(page.getByRole("main")).toContainText("Quantity");

    // Count each status for tallying changes
    const statusArr = [
      "Not Process",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancel",
    ];
    const countOfStatus = {};
    for (let i = 0; i < statusArr.length; i++) {
      const initCount = await page.getByTitle(statusArr[i]).count();
      countOfStatus[statusArr[i]] = initCount;
    }

    for (let i = 0; i < statusArr.length; i++) {
      let currSelected = statusArr[i];
      let nextSelected = statusArr[i + 1];

      // if reached end, make the next selected back to first process
      if (i + 1 >= statusArr.length) {
        nextSelected = statusArr[0];
      }

      console.log(countOfStatus[nextSelected]);
      // Select the new status in dropdown
      await page.getByText(currSelected).first().click();
      await page
        .getByTitle(nextSelected)
        .nth(countOfStatus[nextSelected])
        .click();

      // Update expected count
      countOfStatus[currSelected] -= 1;
      countOfStatus[nextSelected] += 1;

      // Wait to see if error pops up
      await page.waitForTimeout(1000);
      await expect(
        page.getByText("Something Went Wrong Updating")
      ).not.toBeVisible();

      await page.reload();
    }

    // Check expected count same as initial
    await expect(page.getByTitle(statusArr[0])).toHaveCount(
      countOfStatus[statusArr[0]],
      { timeout: 20000 }
    );
  });
});
