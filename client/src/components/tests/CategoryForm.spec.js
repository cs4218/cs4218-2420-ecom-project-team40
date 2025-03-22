import { test, expect } from '@playwright/test';

test.describe('CategoryForm Component', () => {
  test.beforeEach(async ({ page }) => {
    // Set timeout and login
    test.setTimeout(60000);
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
    
    // Wait for post-login redirects
    await page.waitForLoadState('networkidle');
    
    // Navigate directly to the create category page
    console.log('Navigating to create category page...');
    await page.goto('http://localhost:3000/dashboard/admin/create-category');
    await page.waitForLoadState('networkidle');
  });

  test('should render the form correctly', async ({ page }) => {
    // Wait for form to appear
    await page.waitForSelector('[data-testid="category-form"]', { state: 'attached', timeout: 10000 });
    
    // Check form visibility
    const form = await page.getByTestId('category-form');
    await expect(form).toBeVisible();

    // Check input field
    const input = await page.getByPlaceholder('Enter new category');
    await expect(input).toBeVisible();
    await expect(input).toBeEmpty();

    // Check submit button
    const submitButton = await page.getByRole('button', { name: 'Submit' });
    await expect(submitButton).toBeVisible();
  });

  test('should update input value when typing', async ({ page }) => {
    // Wait for input field
    await page.waitForSelector('[placeholder="Enter new category"]', { state: 'attached', timeout: 10000 });
    const input = await page.getByPlaceholder('Enter new category');
    
    // Type and verify input
    await input.fill('Test Category');
    await expect(input).toHaveValue('Test Category');
  });

  test('should handle form submission and create new category', async ({ page }) => {
    // Wait for input field
    await page.waitForSelector('[placeholder="Enter new category"]', { state: 'attached', timeout: 10000 });
    const input = await page.getByPlaceholder('Enter new category');
    
    // Fill form with unique category name
    const categoryName = `Test Category ${Date.now()}`;
    await input.fill(categoryName);
    
    // Get initial category count
    const initialRows = await page.$$('tbody tr');
    const initialCount = initialRows.length;
    console.log('Initial category count:', initialCount);
    
    // Submit form
    const submitButton = await page.getByRole('button', { name: 'Submit' });
    await submitButton.click();
    
    // Wait for category to appear
    await page.waitForTimeout(2000);

    // Wait for category success toast
    try {
      await page.waitForSelector('div:text-matches("is created")', { timeout: 5000 });
      console.log('Category creation success toast appeared');
    } catch (e) {
      console.log('No category creation success toast found');
    }
    
    // Verify new category
    const categoryCell = await page.getByRole('cell', { name: categoryName });
    await expect(categoryCell).toBeVisible();
    
    // Check category count increased
    const newRows = await page.$$('tbody tr');
    console.log('New category count:', newRows.length);
    expect(newRows.length).toBeGreaterThan(initialCount);
    
    // Check edit and delete buttons
    const editButton = await page.locator('tr', { has: page.getByText(categoryName) }).getByRole('button', { name: 'Edit' });
    await expect(editButton).toBeVisible();
    const deleteButton = await page.locator('tr', { has: page.getByText(categoryName) }).getByRole('button', { name: 'Delete' });
    await expect(deleteButton).toBeVisible();
    
    // Delete test category
    await deleteButton.click();
    
    // Wait for delete success
    try {
      await page.waitForSelector('div:text-matches("is deleted")', { timeout: 5000 });
      console.log('Delete success toast appeared');
    } catch (e) {
      console.log('No delete success toast found');
    }

    // Verify category removal
    await page.waitForTimeout(2000);
    const deletedCategoryCell = await page.$(`text=${categoryName}`);
    expect(deletedCategoryCell).toBeNull();
    await expect(categoryCell).not.toBeVisible();
  });

  test('should handle editing an existing category', async ({ page }) => {
    // Create a category to edit
    await page.waitForSelector('[placeholder="Enter new category"]', { state: 'attached', timeout: 10000 });
    const input = await page.getByPlaceholder('Enter new category');
    
    // Generate unique names
    const originalName = `Test Category ${Date.now()}`;
    const updatedName = `Updated Category ${Date.now()}`;
    
    // Create initial category
    await input.fill(originalName);
    const submitButton = await page.getByRole('button', { name: 'Submit' });
    await submitButton.click();
    
    // Wait for category creation
    await page.waitForTimeout(2000);
    
    // Verify category creation
    const categoryCell = await page.getByRole('cell', { name: originalName });
    await expect(categoryCell).toBeVisible();
    
    // Edit category
    const editButton = await page.locator('tr', { has: page.getByText(originalName) }).getByRole('button', { name: 'Edit' });
    await editButton.click();
    await page.waitForSelector('.ant-modal-content');
    
    // Update category name
    const modalInput = await page.locator('.ant-modal-content input[placeholder="Enter new category"]');
    await expect(modalInput).toBeVisible();
    await expect(modalInput).toHaveValue(originalName);
    await modalInput.fill(updatedName);
    
    // Submit edit form
    const modalSubmitButton = await page.locator('.ant-modal-content').getByRole('button', { name: 'Submit' });
    await modalSubmitButton.click();
    
    // Wait for update success
    try {
      await page.waitForSelector('div:text-matches("is updated")', { timeout: 5000 });
      console.log('Update success toast appeared');
    } catch (e) {
      console.log('No update success toast found');
    }
    
    // Wait for update to complete
    await page.waitForTimeout(2000);
    
    // Verify category update
    const oldCategoryCell = await page.$(`text=${originalName}`);
    expect(oldCategoryCell).toBeNull();
    const updatedCategoryCell = await page.getByRole('cell', { name: updatedName });
    await expect(updatedCategoryCell).toBeVisible();
    
    // Delete test category
    const deleteButton = await page.locator('tr', { has: page.getByText(updatedName) }).getByRole('button', { name: 'Delete' });
    await deleteButton.click();
    
    // Wait for delete success
    try {
      await page.waitForSelector('div:text-matches("is deleted")', { timeout: 5000 });
      console.log('Delete success toast appeared');
    } catch (e) {
      console.log('No delete success toast found');
    }
    
    // Wait for deletion to complete
    await page.waitForTimeout(2000);
    
    // Verify category removal
    const deletedCategoryCell = await page.$(`text=${updatedName}`);
    expect(deletedCategoryCell).toBeNull();
  });
}); 