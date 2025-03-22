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

  test('should handle form submission and create new category', async ({ page }) => {
    // Wait for the input to be present
    await page.waitForSelector('[placeholder="Enter new category"]', { state: 'attached', timeout: 10000 });
    const input = await page.getByPlaceholder('Enter new category');
    
    // Generate a unique category name using timestamp
    const categoryName = `Test Category ${Date.now()}`;
    
    // Fill the form
    await input.fill(categoryName);
    
    // Get initial categories from the table
    const initialRows = await page.$$('tbody tr');
    const initialCount = initialRows.length;
    console.log('Initial category count:', initialCount);
    
    // Submit the form
    const submitButton = await page.getByRole('button', { name: 'Submit' });
    await submitButton.click();
    
    // Verify the category was created by checking the list
    // Wait for the category to appear in the list
    await page.waitForTimeout(2000); // Wait for list to update
    
    // Wait for the table to update
    await page.waitForTimeout(1000);
    
    // Verify the new category appears in the table
    const categoryCell = await page.getByRole('cell', { name: categoryName });
    await expect(categoryCell).toBeVisible();
    
    // Verify category count increased by checking table rows
    const newRows = await page.$$('tbody tr');
    console.log('New category count:', newRows.length);
    expect(newRows.length).toBeGreaterThan(initialCount);
    
    // Test that the category has edit button
    const editButton = await page.locator('tr', { has: page.getByText(categoryName) }).getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    
    // Test that the category has delete button
    const deleteButton = await page.locator('tr', { has: page.getByText(categoryName) }).getByRole('button', { name: 'Delete' });
    await expect(deleteButton).toBeVisible();
    
    // Clean up: Delete the test category
    await deleteButton.click();
    
    // Wait for delete success
    try {
      await page.waitForSelector('div:text-matches("is deleted")', { timeout: 5000 });
      console.log('Delete success toast appeared');
    } catch (e) {
      console.log('No delete success toast found');
    }

    // Verify the category was removed from the table
    await page.waitForTimeout(2000); // Wait for list to update

    // Verify the category is no longer in the table
    const deletedCategoryCell = await page.$(`text=${categoryName}`);
    expect(deletedCategoryCell).toBeNull();
    
    // Verify the category was removed
    await expect(categoryCell).not.toBeVisible();
  });
}); 