// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("user menu renders correctly", () => {

  test("user logins and see user menu successfully", async ({ page }) => {

    await page.goto("http://localhost:3000/");
    await page.getByRole("link", { name: "Login" }).click();
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("user@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("user@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "USER@TEST.COM" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();

    // Check user menu 
    await expect(page.getByText("Profile")).toBeVisible();
    await expect(page.getByText("Orders")).toBeVisible();

    await page.getByRole("link", { name: "Profile" }).click();
    await expect(page.getByText("User Profile")).toBeVisible();

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("All Orders")).toBeVisible();
  });
});
