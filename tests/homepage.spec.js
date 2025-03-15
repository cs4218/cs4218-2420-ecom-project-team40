// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Homepage UI tests", () => {
  test("User loads more products successfully", async ({ page }) => {
    await page.goto("http://localhost:3000");
    const initalProductCount = await page.getByText("more details").count();

    // if not visible (dependent on the number of products currently), skip test
    const loadMoreButton = page.getByRole("button", { name: "Load more" });
    const isLoadMoreVisible = await loadMoreButton.isVisible();
    if (!isLoadMoreVisible) {
      test.skip();
    }

    await loadMoreButton.click();
    // await expect(page.getByText("Loading ...")).toBeVisible(); // Shows loading transition

    await expect(loadMoreButton).not.toBeVisible(); //Load button disappears after showing all
    await waitForProductsToLoad(page).toBeGreaterThan(initalProductCount);
  });

  test("User finds a specific product by selecting a price and 2 categories and resets filter", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");

    const bookCheckbox = page.getByRole("checkbox", { name: "Book" });
    const clothingCheckbox = page.getByRole("checkbox", { name: "Clothing" });
    const priceRadio = page.getByRole("radio", { name: "$0 to 19" });

    // Poll until page loads change
    await waitForProductsToLoad(page).toBeGreaterThan(0);

    const initalProductCount = await page.getByText("more details").count();
    await bookCheckbox.click();
    await clothingCheckbox.click();
    await priceRadio.click();

    // Poll until page loads change
    await waitForProductsToLoad(page).toBeLessThan(initalProductCount);

    await expect(
      page.getByRole("heading", { name: "NUS T-shirt" })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Novel" })).toBeVisible();

    await page.getByText("RESET FILTERS").click();

    // Poll until page loads change
    await waitForProductsToLoad(page).toBe(initalProductCount);
  });

  test("User clicks on category with no product then expanded selection to books and restrict to a price range", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000");
    const initalProductCount = await page.getByText("more details").count();

    const emptyCheckbox = page.getByRole("checkbox", { name: "sadsadsa" });
    await emptyCheckbox.click();

    // Poll until page loads change
    waitForProductsToLoad(page).toBe(0);

    const bookCheckbox = page.getByRole("checkbox", { name: "Book" });
    await bookCheckbox.click();

    // Poll until page changes
    await waitForProductsToLoad(page).toBe(3);

    const priceRadio = page.getByRole("radio", { name: "$40 to 59" });
    await priceRadio.click();
    await expect(
      page.getByText("The Law of Contract in Singapore")
    ).toBeVisible();
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
