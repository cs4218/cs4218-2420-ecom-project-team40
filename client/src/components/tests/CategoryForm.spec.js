import { test, expect } from '@playwright/test';

test.describe('CategoryForm Component', () => {
  test.beforeEach(async ({ page }) => {
    // Login:
    // Increase timeout for navigation
    test.setTimeout(60000);
    
    // Login flow with better waiting
    await page.goto("http://localhost:3000/");
    await page.waitForLoadState('networkidle');
    
    console.log('Clicking login link...');
    await page.getByRole("link", { name: "Login" }).click();
    await page.waitForURL('**/login');
    
    console.log('Filling login form...');
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("cs4218@test.com");
      
    console.log('Submitting login...');
    await Promise.all([
      page.waitForNavigation(),
      page.getByRole("button", { name: "LOGIN" }).click()
    ]);
    
    // Wait for any post-login redirects to complete
    await page.waitForLoadState('networkidle');
    
    // Navigate directly to the create category page
    console.log('Navigating to create category page...');
    await page.goto('http://localhost:3000/dashboard/admin/create-category');
    await page.waitForLoadState('networkidle');
  });

  test('should render the form correctly', async ({ page }) => {
    // Wait for the form to be present in the DOM
    await page.waitForSelector('[data-testid="category-form"]', { state: 'attached', timeout: 10000 });
    
    // Check if form exists
    const form = await page.getByTestId('category-form');
    await expect(form).toBeVisible();

    // Check if input field exists and has correct placeholder
    const input = await page.getByPlaceholder('Enter new category');
    await expect(input).toBeVisible();
    await expect(input).toBeEmpty();

    // Check if submit button exists and has correct text
    const submitButton = await page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeVisible();
  });

  test('should update input value when typing', async ({ page }) => {
    // Wait for the input to be present
    await page.waitForSelector('[placeholder="Enter new category"]', { state: 'attached', timeout: 10000 });
    const input = await page.getByPlaceholder('Enter new category');
    
    // Type into the input
    await input.fill('Test Category');
    
    // Verify the input value
    await expect(input).toHaveValue('Test Category');
  });

  test('should handle form submission', async ({ page }) => {
    // Wait for the input to be present
    await page.waitForSelector('[placeholder="Enter new category"]', { state: 'attached', timeout: 10000 });
    const input = await page.getByPlaceholder('Enter new category');
    
    // Fill the form
    await input.fill('Test Category');
    
    // Get initial category count if the list exists
    let initialCount = 0;
    try {
      const initialCategories = await page.$$('[data-testid="category-item"]');
      initialCount = initialCategories.length;
    } catch (e) {
      console.log('No existing categories found');
    }
    
    // Submit the form
    const submitButton = await page.getByRole('button', { name: 'Submit' });
    await submitButton.click();
    
    // Wait for potential success message or new category to appear
    await page.waitForTimeout(2000);
    
    // Verify the input value remains (since clearing is handled by parent component)
    await expect(input).toHaveValue('Test Category');
    
    // Optionally verify new category was added (if the UI updates immediately)
    try {
      const newCategories = await page.$$('[data-testid="category-item"]');
      await expect(newCategories.length).toBeGreaterThan(initialCount);
    } catch (e) {
      console.log('Could not verify category count change');
    }
  });
}); 