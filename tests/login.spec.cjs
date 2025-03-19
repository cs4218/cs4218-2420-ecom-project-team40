const { test, expect } = require('@playwright/test');

test.describe('Login Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login', {waitUntil: "commit"});
  });

  test('should log in with valid fields', async ({ page }) => {
    await page.goto('http://localhost:3000/register', {waitUntil: "commit"});

    // make sure the user has been registered
    await page.fill('input#exampleInputName1', 'John Doe');
    await page.fill('input#exampleInputEmail1', 'testemail@gmail.com'); 
    await page.fill('input#exampleInputPassword1', 'testpassword');
    await page.fill('input#exampleInputPhone1', '33333333');
    await page.fill('input#exampleInputaddress1', 'NUS SoC, Singapore');
    await page.fill('input#exampleInputDOB1', '2025-01-01');
    await page.fill('input#exampleInputanswer1', 'Test');


    await page.click('button:has-text("REGISTER")');

    await page.goto('http://localhost:3000/login', {waitUntil: "commit"});
    
    await page.fill('input#exampleInputEmail1', 'testemail@gmail.com');
    await page.fill('input#exampleInputPassword1', 'testpassword');

    await page.click('button:has-text("LOGIN")');

    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('should display error message on invalid fields', async ({ page }) => {
    await page.fill('input#exampleInputEmail1', 'notsuchemail@example.com');
    await page.fill('input#exampleInputPassword1', 'nosuchpassword');

    await page.click('button:has-text("LOGIN")');

    const errorMessage = page.locator('div[role="status"]');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });

    await expect(errorMessage).toHaveText('Something went wrong');
  });

  test('should not do anything if fields are not filled', async ({ page }) => {
    await page.fill('input#exampleInputEmail1', 'notsuchemail@example.com');
    await page.click('button:has-text("LOGIN")');
    await expect(page).toHaveURL('http://localhost:3000/login');
  });

  test('should navigate to Forgot Password page', async ({ page }) => {
    await page.click('button.forgot-btn');

    await expect(page).toHaveURL('http://localhost:3000/forgot-password');
  });
});