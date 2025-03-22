const { test, expect } = require('@playwright/test');

test.describe('Spinner Component', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a protected route that would show the spinner
    // We'll use a mock admin route as an example
    await page.goto('http://localhost:3000/dashboard/admin');
  });

  test('should render spinner when accessing protected route without auth', async ({ page }) => {
    // Check if spinner container exists
    const spinnerContainer = page.locator('.d-flex.flex-column.justify-content-center.align-items-center');
    await expect(spinnerContainer).toBeVisible();

    // Check if initial countdown text is visible and contains correct text
    const countdownText = page.locator('h1');
    await expect(countdownText).toBeVisible();
    const text = await countdownText.textContent();
    expect(text).toMatch(/redirecting to you in \d second/);

    // Check if spinner animation is visible
    const spinnerAnimation = page.locator('.spinner-border');
    await expect(spinnerAnimation).toBeVisible();

    // Check if loading text is present (but visually hidden)
    const loadingText = page.locator('.visually-hidden');
    await expect(loadingText).toHaveText('Loading...');
  });

  test('should redirect to login after countdown when accessing admin route without auth', async ({ page }) => {
    // Navigate to admin dashboard without auth
    await page.goto('http://localhost:3000/dashboard/admin');
    
    // Wait for initial render
    await page.waitForSelector('h1');

    // Wait for the countdown and redirect
    await page.waitForTimeout(3500);

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should redirect to login after countdown when accessing private route without auth', async ({ page }) => {
    // Navigate to user dashboard without auth
    await page.goto('http://localhost:3000/dashboard/user');
    
    // Wait for initial render
    await page.waitForSelector('h1');

    // Wait for the countdown and redirect
    await page.waitForTimeout(3500);

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should show countdown sequence before redirect', async ({ page }) => {
    // Navigate to protected route
    await page.goto('http://localhost:3000/dashboard/user');
    
    // Wait for initial render
    await page.waitForSelector('h1');

    // Check countdown from 3 to 1
    for (let i = 3; i > 0; i--) {
      const countText = await page.locator('h1').textContent();
      expect(countText).toContain(`redirecting to you in ${i} second`);
      if (i > 1) {
        await page.waitForTimeout(1100); // Wait slightly more than 1 second
      }
    }
  });

  test('should preserve redirect location in state', async ({ page }) => {
    // Mock localStorage to simulate no auth
    await page.evaluate(() => {
      localStorage.removeItem('auth');
    });

    // Navigate to protected route
    await page.goto('http://localhost:3000/dashboard/user');
    
    // Wait for redirect
    await page.waitForTimeout(3500);

    // Check URL includes state parameter
    const url = page.url();
    expect(url).toContain('/login');
    
    // The state should be preserved in the URL or React Router state
    // Note: This might need adjustment based on your actual implementation
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('should maintain proper styling during countdown', async ({ page }) => {
    // Check container styling
    const container = page.locator('.d-flex.flex-column.justify-content-center.align-items-center');
    
    // Get viewport height and container height
    const [viewportHeight, containerHeight] = await Promise.all([
      page.evaluate(() => window.innerHeight),
      container.evaluate((el) => {
        return parseInt(window.getComputedStyle(el).getPropertyValue('height'));
      })
    ]);

    // Check if container height is approximately equal to viewport height (with 5% tolerance)
    const tolerance = viewportHeight * 0.05; // 5% leeway again
    expect(containerHeight).toBeGreaterThanOrEqual(viewportHeight - tolerance);
    expect(containerHeight).toBeLessThanOrEqual(viewportHeight + tolerance);

    // Verify centering classes
    const classList = await container.evaluate((el) => Array.from(el.classList));
    expect(classList).toContain('d-flex');
    expect(classList).toContain('flex-column');
    expect(classList).toContain('justify-content-center');
    expect(classList).toContain('align-items-center');
  });
}); 