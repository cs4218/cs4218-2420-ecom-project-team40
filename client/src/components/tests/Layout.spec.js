const { test, expect } = require('@playwright/test');

test.describe('Layout Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('http://localhost:3000');
  });

  test('should render basic layout structure', async ({ page }) => {
    // Check if header exists
    await expect(page.locator('header, nav')).toBeVisible();

    // Check if main content area exists with correct min-height
    const mainContent = page.locator('main');
    await expect(mainContent).toBeVisible();
    
    // Check if the main content has appropriate min-height (should be around 70% of viewport height)
    const viewportHeight = await page.evaluate(() => window.innerHeight);
    const mainHeight = await mainContent.evaluate((el) => {
      return parseInt(window.getComputedStyle(el).getPropertyValue('min-height'));
    });
    
    // Check if mainHeight is approximately 70% of viewport height (with 5% tolerance)
    const expectedHeight = viewportHeight * 0.7;
    const tolerance = viewportHeight * 0.05; // 5% leeway just in case
    expect(mainHeight).toBeGreaterThanOrEqual(expectedHeight - tolerance);
    expect(mainHeight).toBeLessThanOrEqual(expectedHeight + tolerance);

    // Check if footer exists
    await expect(page.locator('.footer')).toBeVisible();
  });

  test('should have correct default meta tags', async ({ page }) => {
    // Check title of home page
    await expect(page).toHaveTitle('ALL Products - Best offers ');

    // Check meta tags - specifically target react-helmet meta tags
    const description = await page.locator('meta[name="description"][data-react-helmet="true"]').getAttribute('content');
    const keywords = await page.locator('meta[name="keywords"][data-react-helmet="true"]').getAttribute('content');
    const author = await page.locator('meta[name="author"][data-react-helmet="true"]').getAttribute('content');

    expect(description).toBe('mern stack project');
    expect(keywords).toBe('mern,react,node,mongodb');
    expect(author).toBe('Techinfoyt');
  });

  test('should maintain consistent layout across different routes', async ({ page }) => {
    // Check home page
    await page.goto('http://localhost:3000');
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();

    // Check categories page
    await page.goto('http://localhost:3000/categories');
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();

    // Check cart page
    await page.goto('http://localhost:3000/cart');
    await expect(page.locator('header, nav')).toBeVisible();
    await expect(page.locator('.footer')).toBeVisible();
  });
}); 