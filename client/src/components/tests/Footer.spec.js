const { test, expect } = require('@playwright/test');

test.describe('Footer Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the page where Footer is rendered
    await page.goto('http://localhost:3000');
  });

  test('should render footer', async ({ page }) => {
    // Check if footer exists
    const footer = await page.locator('.footer');
    await expect(footer).toBeVisible();
  });

  test('should display correct copyright text', async ({ page }) => {
    const copyrightText = await page.locator('.footer h4');
    await expect(copyrightText).toHaveText('All Rights Reserved © TestingComp');
  });

  test('should have working navigation links', async ({ page }) => {
    // Test About link
    const aboutLink = await page.locator('.footer a[href="/about"]');
    await expect(aboutLink).toBeVisible();
    await expect(aboutLink).toHaveText('About');

    // Test Contact link
    const contactLink = await page.locator('.footer a[href="/contact"]');
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveText('Contact');

    // Test Privacy Policy link
    const policyLink = await page.locator('.footer a[href="/policy"]');
    await expect(policyLink).toBeVisible();
    await expect(policyLink).toHaveText('Privacy Policy');
  });

  test('should navigate to correct pages when clicking links', async ({ page }) => {
    // Test About link navigation
    await page.click('.footer a[href="/about"]');
    await expect(page).toHaveURL(/.*\/about/);

    // Navigate back and test Contact link
    await page.goto('http://localhost:3000');
    await page.click('.footer a[href="/contact"]');
    await expect(page).toHaveURL(/.*\/contact/);

    // Navigate back and test Privacy Policy link
    await page.goto('http://localhost:3000');
    await page.click('.footer a[href="/policy"]');
    await expect(page).toHaveURL(/.*\/policy/);
  });
}); 