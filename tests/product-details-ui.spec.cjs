const { test, expect } = require('@playwright/test');

test.describe('Product Details Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/product/the-law-of-contract-in-singapore', { waitUntil: 'networkidle' });
  });

  test('should display product details correctly', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Product Details');
    await expect(page.locator('h6').nth(0)).toContainText('Name : The Law of Contract in Singapore');
    await expect(page.locator('h6').nth(1)).toContainText('Description : A bestselling book in Singapore');
    await expect(page.locator('h6').nth(2)).toContainText('Price :$54.99');
    await expect(page.locator('h6').nth(3)).toContainText('Category : Book');
  });

  test('should display similar products at the bottom', async ({ page }) => {
    const similarProducts = page.locator('.card');
    const count = await similarProducts.count();

    await expect(page.locator('.similar-products h4')).toContainText('Similar Products ➡️');
    expect(count).toBeGreaterThan(0);
  });

  test('should display selected product image', async ({ page }) => {
    const productImage = page.locator('.product-details img');
    await expect(productImage).toBeVisible();
    const srcLink = await productImage.getAttribute('src');

    expect(srcLink).toMatch(/\/api\/v1\/product\/product-photo\/\w+/);
  });

  test('adding selected product should display a notification', async ({ page }) => {
    await page.getByRole('button', { name: 'ADD TO CART' }).click();
    const notification = page.locator('div[role="status"]');
    await notification.waitFor({ state: 'visible', timeout: 1000 });

    await expect(notification).toContainText('Item Added to cart');
  });

  test('should add selected product to cart', async ({ page }) => {
    await page.getByRole('button', { name: 'ADD TO CART' }).click();
    await page.goto('http://localhost:3000/cart');
    
    await page.waitForSelector('.row.card.flex-row');
    const productCard = page.locator('.row.card.flex-row').first();
    const totalPriceElement = page.locator('[data-testid="total-price"]');
    
    await expect(productCard.locator('p').first()).toContainText('The Law of Contract in Singapore');
    await expect(productCard.locator('p').nth(2)).toContainText('Price : 54.99');
    await expect(totalPriceElement).toContainText('$54.99');
  });

  test('should navigate to the correct similar product details page', async ({ page }) => {
    const firstSimilarProduct = page.locator('.card.m-2').first();
    const productName = await firstSimilarProduct.locator('.card-title').first().textContent();
    const productPrice = await firstSimilarProduct.locator('.card-price').textContent();
    await firstSimilarProduct.getByRole('button', { name: 'More Details' }).click();

    await expect(page).toHaveURL(/\/product\//);
    await expect(page.locator('h6').nth(0)).toContainText(`Name : ${productName}`);
    await expect(page.locator('h6').nth(2)).toContainText(`Price :${productPrice}`);
  });
});