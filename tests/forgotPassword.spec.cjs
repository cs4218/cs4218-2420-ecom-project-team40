const { test, expect } = require('@playwright/test');

test.describe('Forgot Password Page Tests', () => {

  let uniqueEmail = `${Date.now()}@gmail.com`

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/register", {waitUntil: "commit"});
    
    // make sure the user has been registered
    await page.fill('input#exampleInputName1', 'John Doe');
    await page.fill('input#exampleInputEmail1', uniqueEmail); 
    await page.fill('input#exampleInputPassword1', 'testpassword');
    await page.fill('input#exampleInputPhone1', '33333333');
    await page.fill('input#exampleInputaddress1', 'NUS SoC, Singapore');
    await page.fill('input#exampleInputDOB1', '2025-01-01');
    await page.fill('input#exampleInputanswer1', 'Test');


    await page.click('button:has-text("REGISTER")');
    await page.goto('http://localhost:3000/forgot-password', {waitUntil: "commit"});
  });

  test('should not do anything if answer is wrong', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Enter Your Answer' }).fill('wrongAnswer');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newPassword');

    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    const errorToast = page.locator('div[role="status"]');
    await errorToast.waitFor({ state: 'visible', timeout: 5000 });

    await expect(errorToast).toHaveText('Something went wrong');
  });

  test('should not do anything if essential field is empty', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Enter Your Answer' }).fill('');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newPassword');

    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    await expect(page).toHaveURL('http://localhost:3000/forgot-password');
  });

  test('should successfully reset password if fields are correct', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Enter Your Email' }).fill(uniqueEmail);
    await page.getByRole('textbox', { name: 'Enter Your Answer' }).fill('Test');
    await page.getByRole('textbox', { name: 'Enter Your New Password' }).fill('newPassword');

    await page.getByRole('button', { name: 'RESET PASSWORD' }).click();

    await expect(page).toHaveURL('http://localhost:3000/login');
  });
});