// @ts-check
const { test, expect } = require("@playwright/test");

const loginFlow = async (page) => {
  // Login flow
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Login" }).click();
  await page
    .getByRole("textbox", { name: "Enter Your Email" })
    .fill("test@gmail.com");
  await page
    .getByRole("textbox", { name: "Enter Your Password" })
    .fill("test@gmail.com");
  await page.getByRole("button", { name: "LOGIN" }).click();

  await expect(page.getByText("login successfully")).toBeVisible();
};

test.describe("Cart integration tests", () => {
  test.beforeEach(async ({ page }) => {
    await loginFlow(page);
  });

  test("User adds to cart successfully and checks out with card", async ({
    page,
  }) => {
    // Load homepage
    await expect(page.getByText("All Products")).toBeVisible();
    await waitForProductsToLoad(page).toBeGreaterThan(0);

    // Add to cart
    const novelBookCartButton = page
      .locator(".card")
      .filter({ hasText: /Novel/ })
      .first()
      .getByText("Add to cart");

    await novelBookCartButton.click();
    await novelBookCartButton.click();

    const nusShirtCartButton = page
      .locator(".card")
      .filter({ hasText: /NUS T-shirt/ })
      .first()
      .getByText("Add to cart");

    await nusShirtCartButton.click();
    await nusShirtCartButton.click();

    // Check cart indicates 4 items
    await expect(page.getByRole("superscript")).toContainText("4");

    // Go to cart
    await page.getByRole("link", { name: "Cart" }).click();

    // Remove duplicate items from cart
    await page.getByRole("button", { name: "Remove" }).nth(0).click();
    await page.getByRole("button", { name: "Remove" }).nth(2).click();

    // Assert the information on cart page is accurate
    await expect(page.getByRole("superscript")).toContainText("2");
    await expect(page.getByText("You have 2 items in your cart")).toBeVisible();
    await expect(page.getByText("Total : $19.98")).toBeVisible();

    // Pay with card
    const CardButton = page.getByRole("button", { name: "Paying with Card" });

    await expect(CardButton).toBeVisible({ timeout: 10000 });
    await CardButton.click();

    const creditCardField = page
      .locator('iframe[name="braintree-hosted-field-number"]')
      .contentFrame()
      .getByRole("textbox", { name: "Credit Card Number" });
    await expect(creditCardField).toBeVisible({ timeout: 10000 });
    await creditCardField.fill("4111111111111111");
    await page
      .locator('iframe[name="braintree-hosted-field-expirationDate"]')
      .contentFrame()
      .getByRole("textbox", { name: "Expiration Date" })
      .fill("10/29");

    await page.getByText("Make Payment").click();
    // Assert the payment succeed and navigates to order page
    await expect(
      page.getByText("Payment Completed Successfully")
    ).toBeVisible();
    await expect(page.getByText("All Orders")).toBeVisible();

    // Check the orders have the 2 products purchased
    const container = page.locator(".container").first();
    await expect(container).toBeVisible({ timeout: 10000 });
    await expect(container).toContainText("Novel");
    await expect(container).toContainText("NUS T-shirt");
  });
});

// Helper function to wait for products to load
function waitForProductsToLoad(page) {
  return expect.poll(
    async () => {
      return await page.getByText("more details").count();
    },
    {
      timeout: 10000,
      message: "Waiting for all products to load",
    }
  );
}
