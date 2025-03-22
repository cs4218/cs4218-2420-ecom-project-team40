const { test, expect } = require('@playwright/test');

test.describe('Category Product Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/category/electronics', { waitUntil: 'networkidle' });
  });

  test('should display correct category and product count', async ({ page }) => {
    const resultText = await page.locator('h6.text-center').textContent();

    await expect(page.getByRole('heading', { name: 'Category - Electronics' })).toBeVisible();
    expect(resultText).toMatch(/2 result found/);
  });

  test('should display product images', async ({ page }) => {
    const productImages = page.locator('.card-img-top');
    const count = await productImages.count();

    for (let i = 0; i < count; i++) {
      const productImage = productImages.nth(i);
      const srcLink = await productImage.getAttribute('src');

      await expect(productImage).toBeVisible();
      expect(srcLink).toMatch(/\/api\/v1\/product\/product-photo\/\w+/);
    }
  });

  test('should display products with correct information', async ({ page }) => {
    const firstProductCard = page.locator('.card.m-2').first();
    const description = await firstProductCard.locator('.card-text').textContent();
    
    expect(firstProductCard.locator('.card-title').first()).toContainText('Laptop');
    expect(firstProductCard.locator('.card-price')).toContainText('$1,499.99');
    expect(description).toMatch(/\.\.\.$/);
  });

  test('should navigate to correct product details page', async ({ page }) => {
    const firstProductCard = page.locator('.card.m-2').first();
    const productName = await firstProductCard.locator('.card-title').first().textContent();
    const productPrice = await firstProductCard.locator('.card-price').textContent();
    await firstProductCard.getByRole('button', { name: 'More Details' }).click();
  
    await expect(page).toHaveURL(/\/product\/laptop/i);
    await expect(page.locator('h6').nth(0)).toContainText(productName);
    await expect(page.locator('h6').nth(2)).toContainText(productPrice);
  });
});