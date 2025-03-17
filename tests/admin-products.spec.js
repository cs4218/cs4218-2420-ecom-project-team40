// @ts-check
const { test, expect } = require("@playwright/test");
const { skip } = require("node:test");
const path = require("path");

const waitForProductFormLoad = async (page, productName) => {
  await expect
    .poll(
      async () => {
        return await page.getByPlaceholder("Write a name").inputValue();
      },
      {
        timeout: 10000,
        message: "Waiting for product to load",
      }
    )
    .toBe(productName);
};

const deleteProduct = async (page, productName) => {
  // Navigate to update product page
  const testProduct = page.getByText(productName).first();
  await expect(testProduct).toBeVisible();
  await testProduct.click();

  await waitForProductFormLoad(page, productName);

  // Setup listener to handle delete confirmation dialog
  page.once("dialog", (dialog) => {
    console.log(
      `Dialog appeared: ${dialog.type()} with message: "${dialog.message()}"`
    );
    dialog.accept("yes");
  });
  await page.getByRole("button", { name: "DELETE PRODUCT" }).click();

  // Assert delete successful
  await expect(page.getByText("Product Deleted Successfully")).toBeVisible();
  await expect(page.getByText("All Products List")).toBeVisible();
};

const fillCreateProductForm = async ({
  page,
  category = "",
  photo = "",
  name = "",
  description = "",
  price = "",
  quantity = "",
  shipping = "",
}) => {
  // Navigate to create product page
  await page.getByRole("link", { name: "Create Product" }).click();
  await expect(
    page.getByRole("heading", { name: "Create Product" })
  ).toBeVisible();

  if (category) {
    // Select category input
    await page.locator(".ant-select-selection-search-input").first().click();
    await page.getByTitle(category).click();
  }

  if (photo) {
    // Simulate upload photo
    await page
      .getByLabel("Upload Photo")
      .setInputFiles(path.join(__dirname, photo));
  }

  // Field inputs
  await page.getByPlaceholder("Write a name").fill(name);
  await page.getByPlaceholder("Write a description").fill(description);
  await page.getByPlaceholder("Write a price").fill(price);
  await page.getByPlaceholder("Write a quantity").fill(quantity);

  if (shipping) {
    // Select shipping input
    await page.locator(".ant-select-selection-search-input").nth(1).click();
    await page.getByTitle(shipping).click();
  }

  // Submit form
  await page.getByRole("button", { name: "CREATE PRODUCT" }).click();
};

const fillUpdateProductForm = async ({
  page,
  productName,
  category = "",
  photo = "",
  name = "",
  description = "",
  price = "",
  quantity = "",
  shipping = "",
}) => {
  // Navigate to update product page
  await page.getByRole("link", { name: "Products" }).click();
  await expect(page.getByText("All Products List")).toBeVisible();

  const testProduct = page.getByText(productName).first();
  await expect(testProduct).toBeVisible();
  await testProduct.click();

  await waitForProductFormLoad(page, productName);

  if (category) {
    // Select category input
    await page.locator(".ant-select-selection-item").first().click();
    await page.getByTitle(category).click();
  }

  if (photo) {
    // Simulate upload photo
    await page
      .getByLabel("Upload Photo")
      .setInputFiles(path.join(__dirname, photo));
  }

  // Field inputs (when textbox are not empty, need to use role)
  await page.getByRole("textbox", { name: "Write a name" }).fill(name);
  await page
    .getByRole("textbox", { name: "Write a description" })
    .fill(description);
  await page.getByPlaceholder("Write a price").fill(price);
  await page.getByPlaceholder("Write a quantity").fill(quantity);

  if (shipping) {
    // Select shipping input
    await page.locator(".ant-select-selection-item").nth(1).click();
    await page.getByTitle(shipping).click();
  }

  // Submit form
  await page.getByRole("button", { name: "UPDATE PRODUCT" }).click();
};

const loginFlow = async (page) => {
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
};

// test.describe.serial("Admin manage product flow", () => {
test.describe("Admin create products flow", () => {
  test.beforeEach("Admin navigates to admin panel", async ({ page }) => {
    await loginFlow(page);
  });

  // Do pairwise testing with the fields being empty or non empty (7 test cases)
  // Test product created and deleted
  test("Admin create product successfully and deletes it", async ({ page }) => {
    await fillCreateProductForm({
      page,
      category: "Electronics",
      photo: "../client/public/images/a2.png",
      name: "Test product create",
      description: "A product created for testing.",
      price: "88",
      quantity: "100",
      shipping: "No",
    });

    // Assert success in creating product
    await expect(
      page.getByText("something went wrong creating product")
    ).not.toBeVisible();
    await expect(page.getByText("Product Created Successfully")).toBeVisible();
    await expect(page.getByText("All Products List")).toBeVisible();

    // Clean up by deleting product
    await deleteProduct(page, "Test product create");
  });

  // Test empty input fields
  test("Product create should fail with only description and price provided", async ({
    page,
  }) => {
    await fillCreateProductForm({
      page,
      description: "A product created for testing.",
      price: "88",
    });

    // Assert failure in creating product
    await expect(
      page.getByText("something went wrong creating product")
    ).toBeVisible();
    await expect(page.getByText("All Products List")).not.toBeVisible();
  });

  test("Product create should fail with only category, name, shipping provided", async ({
    page,
  }) => {
    await fillCreateProductForm({
      page,
      category: "Electronics",
      name: "Test product",
      shipping: "No",
    });

    // Assert failure in creating product
    await expect(
      page.getByText("something went wrong creating product")
    ).toBeVisible();
    await expect(page.getByText("All Products List")).not.toBeVisible();
  });

  test("Product create should fail with only category, photo, shipping provided", async ({
    page,
  }) => {
    await fillCreateProductForm({
      page,
      category: "Electronics",
      photo: "../client/public/images/a2.png",
      shipping: "No",
    });

    // Assert failure in creating product
    await expect(
      page.getByText("something went wrong creating product")
    ).toBeVisible();
    await expect(page.getByText("All Products List")).not.toBeVisible();
  });

  test("Product create should fail with only name, description, qty, shipping provided", async ({
    page,
  }) => {
    await fillCreateProductForm({
      page,
      name: "Test product",
      description: "A product created for testing.",
      quantity: "100",
      shipping: "No",
    });

    // Assert failure in creating product
    await expect(
      page.getByText("something went wrong creating product")
    ).toBeVisible();
    await expect(page.getByText("All Products List")).not.toBeVisible();
  });

  test("Product create should fail with only photo, price, qty provided", async ({
    page,
  }) => {
    await fillCreateProductForm({
      page,
      photo: "../client/public/images/a2.png",
      price: "88",
      quantity: "100",
    });

    // Assert failure in creating product
    await expect(
      page.getByText("something went wrong creating product")
    ).toBeVisible();
    await expect(page.getByText("All Products List")).not.toBeVisible();
  });

  test("Product create should fail with only description provided", async ({
    page,
  }) => {
    await fillCreateProductForm({
      page,
      description: "A product created for testing.",
    });

    // Assert failure in creating product
    await expect(
      page.getByText("something went wrong creating product")
    ).toBeVisible();
    await expect(page.getByText("All Products List")).not.toBeVisible();
  });
});

const createProduct = async (page, productName) => {
  // Create product first
  await fillCreateProductForm({
    page,
    category: "Electronics",
    photo: "../client/public/images/a2.png",
    name: productName,
    description: "A product created for testing.",
    price: "88",
    quantity: "100",
    shipping: "No",
  });

  // Assert success in creating product
  await expect(
    page.getByText("something went wrong creating product")
  ).not.toBeVisible();
  await expect(page.getByText("Product Created Successfully")).toBeVisible();
  await expect(page.getByText("All Products List")).toBeVisible();
};

// New product details
const newProductInfo = {
  category: "Clocks",
  photo: "../client/public/images/l1.png",
  name: "Test updated product success",
  description: "A product updated for testing.",
  price: "12",
  quantity: "50",
  shipping: "Yes",
};

test.describe("Admin update products flow", () => {
  test.describe("Admin update success test", () => {
    test.beforeEach("Admin creates product", async ({ page }) => {
      await loginFlow(page);
    });

    // Do pairwise testing with the fields being empty or non empty (7 test cases)
    // Test product updated
    test("Admin update product successfully", async ({ page }) => {
      // Navigate to update product page
      // await page.getByRole("link", { name: "Products" }).click();
      // await expect(page.getByText("All Products List")).toBeVisible();

      // const testProduct = page.getByText("Test product").first();
      // await expect(testProduct).toBeVisible();
      // await testProduct.click();

      // Create product first
      await createProduct(page, "Test product2");

      await fillUpdateProductForm({
        page,
        productName: "Test product2",
        ...newProductInfo,
      });

      // Assert success in updating product
      await expect(page.getByText("something went wrong")).not.toBeVisible();
      await expect(page.getByText("Product Updated Successfully")).toBeVisible({
        timeout: 8000,
      });
      await expect(page.getByText("All Products List")).toBeVisible();

      // Assert the updated product is in the list
      await expect(page.getByText("Test updated product success")).toBeVisible({
        timeout: 8000,
      });
      await expect(
        page.getByText("A product updated for testing.")
      ).toBeVisible();

      // Navigate to update product page to check all details
      await page.getByText("Test updated product success").click();

      // Assert all the details are updated correctly
      await waitForProductFormLoad(page, "Test updated product success");
      await page.getByText(newProductInfo.category);
      await page.getByText(newProductInfo.name);
      await page.getByText(newProductInfo.description);
      await page.getByText(newProductInfo.price);
      await page.getByText(newProductInfo.quantity);
      await page.getByText(newProductInfo.shipping);
      await page.getByRole("img", { name: "product_photo" });

      // Navigate to update product page
      await page.getByRole("link", { name: "Products" }).click();
      await expect(page.getByText("All Products List")).toBeVisible();
      await deleteProduct(page, "Test updated product success");
    });

    test("Product can be deleted successfully", async ({ page }) => {
      // Create product first
      await createProduct(page, "Test product delete");
      // Delete product
      await deleteProduct(page, "Test product delete");
    });
  });

  test.describe.serial("Admin update fail tests", () => {
    test.beforeEach("Admin creates product", async ({ page }) => {
      // Navigate to product page
      await loginFlow(page);
      await page.getByRole("link", { name: "Products" }).click();
      await expect(page.getByText("All Products List")).toBeVisible();

      // Create product first
      await createProduct(page, "Test updated product fail");
    });

    // Test empty input fields
    test("Product update should fail with only description and price provided", async ({
      page,
    }) => {
      await fillUpdateProductForm({
        page,
        productName: "Test updated product fail",
        description: newProductInfo.description,
        price: newProductInfo.price,
      });

      // Assert failure in updating product
      await expect(page.getByText("something went wrong")).toBeVisible();
      await expect(page.getByText("All Products List")).not.toBeVisible();
    });

    test("Product update should fail with only category, name, shipping provided", async ({
      page,
    }) => {
      await fillUpdateProductForm({
        page,
        productName: "Test updated product fail",
        category: newProductInfo.category,
        name: newProductInfo.name,
        shipping: newProductInfo.shipping,
      });

      // Assert failure in updating product
      await expect(page.getByText("something went wrong")).toBeVisible();
      await expect(page.getByText("All Products List")).not.toBeVisible();
    });

    test("Product update should fail with only category, photo, shipping provided", async ({
      page,
    }) => {
      await fillUpdateProductForm({
        page,
        productName: "Test updated product fail",
        category: newProductInfo.category,
        photo: newProductInfo.photo,
        shipping: newProductInfo.shipping,
      });

      // Assert failure in updating product
      await expect(page.getByText("something went wrong")).toBeVisible();
      await expect(page.getByText("All Products List")).not.toBeVisible();
    });

    test("Product update should fail with only name, description, qty, shipping provided", async ({
      page,
    }) => {
      await fillUpdateProductForm({
        page,
        productName: "Test updated product fail",
        name: newProductInfo.name,
        description: newProductInfo.description,
        quantity: newProductInfo.quantity,
        shipping: newProductInfo.shipping,
      });

      // Assert failure in updating product
      await expect(page.getByText("something went wrong")).toBeVisible();
      await expect(page.getByText("All Products List")).not.toBeVisible();
    });

    test("Product update should fail with only photo, price, qty provided", async ({
      page,
    }) => {
      await fillUpdateProductForm({
        page,
        productName: "Test updated product fail",
        photo: newProductInfo.photo,
        price: newProductInfo.price,
        quantity: newProductInfo.quantity,
      });

      // Assert failure in updating product
      await expect(page.getByText("something went wrong")).toBeVisible();
      await expect(page.getByText("All Products List")).not.toBeVisible();
    });

    test("Product update should fail with only description provided", async ({
      page,
    }) => {
      await fillUpdateProductForm({
        page,
        productName: "Test updated product fail",
        description: newProductInfo.description,
      });

      // Assert failure in updating product
      await expect(page.getByText("something went wrong")).toBeVisible();
      await expect(page.getByText("All Products List")).not.toBeVisible();
    });

    test.afterEach("Remove product", async ({ page }) => {
      // Navigate to product page
      await page.getByRole("link", { name: "Products" }).click();
      await expect(page.getByText("All Products List")).toBeVisible();

      // Cleanup product
      await deleteProduct(page, "Test updated product fail");
      await page.close();
    });
  });
});
// });
