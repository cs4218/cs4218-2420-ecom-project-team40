const { test, expect } = require('@playwright/test');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const mongoURI = process.env.MONGO_URL|| 
async function getUserModel() {
  return await import('../../models/userModel.js'); 
}

async function deleteUserByEmail(email) {
  try {
    // Connect to the MongoDB database
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const { default: userModel } = await getUserModel();

    const result = await userModel.findOneAndDelete({ email: email });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error deleting user:', error);
  }
}

test.describe('Register Page Tests', () => {

  let uniqueEmail;

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/register', {waitUntil: "commit"});
  });

  test('should register successfully with unique details', async ({ page }) => {
    uniqueEmail = `testregister${Date.now()}@gmail.com`;  

    await page.fill('input#exampleInputName1', 'John Doe');
    await page.fill('input#exampleInputEmail1', uniqueEmail); 
    await page.fill('input#exampleInputPassword1', 'testPassword');
    await page.fill('input#exampleInputPhone1', '33333333');
    await page.fill('input#exampleInputaddress1', 'NUS SoC, Singapore');
    await page.fill('input#exampleInputDOB1', '2025-01-01');
    await page.fill('input#exampleInputanswer1', 'Test');


    await page.click('button:has-text("REGISTER")');

    await expect(page).toHaveURL('http://localhost:3000/login');
  });


  test('should display error message when email is already registered', async ({ page }) => {
    // add user first
    let uniqueUser = `${Date.now()} user`;

    await page.fill('input#exampleInputName1', uniqueUser);
    await page.fill('input#exampleInputEmail1', 'alreadyregistered@gmail.com'); 
    await page.fill('input#exampleInputPassword1', 'testPassword');
    await page.fill('input#exampleInputPhone1', '33333333');
    await page.fill('input#exampleInputaddress1', 'NUS SoC, Singapore');
    await page.fill('input#exampleInputDOB1', '2025-01-01');
    await page.fill('input#exampleInputanswer1', 'Test');

    await page.click('button:has-text("REGISTER")');

    // try again
    await page.goto('http://localhost:3000/register', {waitUntil: "commit"});

    await page.fill('input#exampleInputName1', uniqueUser);
    await page.fill('input#exampleInputEmail1', 'alreadyregistered@gmail.com'); 
    await page.fill('input#exampleInputPassword1', 'testPassword');
    await page.fill('input#exampleInputPhone1', '33333333');
    await page.fill('input#exampleInputaddress1', 'NUS SoC, Singapore');
    await page.fill('input#exampleInputDOB1', '2025-01-01');
    await page.fill('input#exampleInputanswer1', 'Test');

    await page.click('button:has-text("REGISTER")');

    const errorToast = page.locator('div[role="status"]');
    await errorToast.waitFor({ state: 'visible', timeout: 5000 });

    await expect(errorToast).toHaveText('Already Register please login');
  });

  test.afterEach(async () => {
    if (uniqueEmail) {
      console.log(`Deleting test user account: ${uniqueEmail}`);
      await deleteUserByEmail(uniqueEmail);
    }
  });

});