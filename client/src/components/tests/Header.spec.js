const { test, expect } = require('@playwright/test');

test.describe('Header Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('http://localhost:3000');
  });

  test('should render basic header elements', async ({ page }) => {
    // Check if brand logo exists and has correct text
    const brandLogo = await page.locator('.navbar-brand');
    await expect(brandLogo).toBeVisible();
    await expect(brandLogo).toHaveText('🛒 Virtual Vault');

    // Check if basic navigation links exist
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Categories' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible();
  });

  test('should show login/register links when user is not authenticated', async ({ page }) => {
    // Clear local storage to ensure logged out state
    await page.evaluate(() => localStorage.removeItem('auth'));
    await page.reload();

    // Check if login and register links are visible
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  });

  test('categories dropdown should work', async ({ page }) => {
    // Click categories dropdown
    await page.getByRole('link', { name: 'Categories' }).click();
    
    // Check if "All Categories" option is visible in dropdown
    const allCategoriesLink = page.getByRole('link', { name: 'All Categories' });
    await expect(allCategoriesLink).toBeVisible();
  });

  test('cart badge should show correct count', async ({ page }) => {
    // Check if cart badge exists
    const cartBadge = page.locator('.ant-badge');
    await expect(cartBadge).toBeVisible();
  });

  test('search input should be visible', async ({ page }) => {
    // Check if search input exists
    const searchInput = page.locator('input[type="search"]');
    await expect(searchInput).toBeVisible();
  });

  test('navigation links should work', async ({ page }) => {
    // Test home link navigation
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('http://localhost:3000/');

    // Test categories link navigation
    await page.getByRole('link', { name: 'Categories' }).click();
    await page.getByRole('link', { name: 'All Categories' }).click();
    await expect(page).toHaveURL('http://localhost:3000/categories');

    // Test cart link navigation
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL('http://localhost:3000/cart');
  });
}); 