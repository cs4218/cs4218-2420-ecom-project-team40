const { test, expect } = require('@playwright/test');

test.describe('Page Not Found Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a non-existent route to trigger 404 page
    await page.goto('http://localhost:3000/non-existent-route');
  });

  test('should render 404 page with correct content', async ({ page }) => {
    // Check if the page title is correct
    await expect(page).toHaveTitle('go back- page not found');

    // Check if main container exists
    const container = page.locator('.pnf');
    await expect(container).toBeVisible();

    // Check if 404 text is present
    const title = page.locator('.pnf-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('404');

    // Check if error message is present
    const heading = page.locator('.pnf-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText('Oops ! Page Not Found');

    // Check if back button is present
    const backButton = page.locator('.pnf-btn');
    await expect(backButton).toBeVisible();
    await expect(backButton).toHaveText('Go Back');
  });

  test('should navigate to home page when clicking Go Back button', async ({ page }) => {
    // Click the Go Back button
    await page.click('.pnf-btn');

    // Verify navigation to home page
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should maintain layout structure', async ({ page }) => {
    // Check if Layout component is properly rendered
    // This assumes Layout adds some consistent structure to the page
    
    // Check if header/nav exists (from Layout)
    await expect(page.locator('header, nav')).toBeVisible();

    // Check if footer exists (from Layout)
    await expect(page.locator('.footer')).toBeVisible();

    // Check if main content is between header and footer
    const mainContent = page.locator('.pnf');
    await expect(mainContent).toBeVisible();
  });

  test('should have proper styling classes', async ({ page }) => {
    // Check if all required classes are present
    const container = page.locator('.pnf');
    const title = page.locator('.pnf-title');
    const heading = page.locator('.pnf-heading');
    const button = page.locator('.pnf-btn');

    // Verify elements are visible
    await expect(container).toBeVisible();
    await expect(title).toBeVisible();
    await expect(heading).toBeVisible();
    await expect(button).toBeVisible();

    // Get classes for each element
    const buttonClasses = await button.evaluate(el => Array.from(el.classList));
    expect(buttonClasses).toContain('pnf-btn');

    // Verify button is clickable
    await expect(button).toBeEnabled();
  });
}); 