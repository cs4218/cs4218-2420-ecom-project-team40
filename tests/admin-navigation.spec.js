// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("admin dashboard navigation flow", () => {
  // test.beforeEach(async ({ page }) => {});

  test("admin logins and goes to dashboard successfully", async ({ page }) => {
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
    await expect(
      page.getByText(/Admin Name : CS 4218 Test Account/)
    ).toBeVisible();
    await expect(page.getByText(/Admin Email : cs4218@test.com/)).toBeVisible();
    await expect(page.getByText(/Admin Contact : 81234567/)).toBeVisible();

    // Check navigation menu
    const createCategoryButton = page.getByRole("link", {
      name: "Create Category",
    });
    const createProductButton = page.getByRole("link", {
      name: "Create Product",
    });
    const productsButton = page.getByRole("link", { name: "Products" });
    const ordersButton = page.getByRole("link", { name: "Orders" });
    const usersButton = page.getByRole("link", { name: "Users" });

    await expect(createCategoryButton).toBeVisible();
    await expect(createProductButton).toBeVisible();
    await expect(productsButton).toBeVisible();
    await expect(ordersButton).toBeVisible();
    await expect(usersButton).toBeVisible();

    await createCategoryButton.click();
    await expect(page.getByText("Manage Category")).toBeVisible();

    await createProductButton.click();
    await expect(
      page.getByRole("heading", { name: "Create Product" })
    ).toBeVisible();

    await productsButton.click();
    await expect(page.getByText("All Products List")).toBeVisible();

    await ordersButton.click();
    await expect(page.getByText("All Orders")).toBeVisible();

    await usersButton.click();
    await expect(page.getByText("All Users")).toBeVisible();
  });
});
