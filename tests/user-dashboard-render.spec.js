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

test.describe('Dashboard Page Tests', () => {

  let uniqueEmail;
  let uniqueEmail1;
  let uniqueEmail2;

  test('should be able to navigate to the dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/register', {waitUntil: "commit"});
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
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(uniqueEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("testPassword");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByText("Profile")).toBeVisible();
    await expect(page.getByText("Orders")).toBeVisible();
  });

  test('should render the user details in dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/register', {waitUntil: "commit"});
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
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(uniqueEmail);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("testPassword");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByText("Profile")).toBeVisible();
    await expect(page.getByText("Orders")).toBeVisible();

    const nameElement = await page.getByTestId('name').textContent();
    expect(nameElement).toBe('John Doe');

    const emailElement = await page.getByTestId('email').textContent();
    expect(emailElement).toBe(uniqueEmail);

    const addressElement = await page.getByTestId('address').textContent();
    expect(addressElement).toBe('NUS SoC, Singapore');
  });

  test('should render only the user details in dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/register', {waitUntil: "commit"});
    uniqueEmail1 = `testregister${Date.now()}@gmail.com`;  

    await page.fill('input#exampleInputName1', 'John Doe');
    await page.fill('input#exampleInputEmail1', uniqueEmail1); 
    await page.fill('input#exampleInputPassword1', 'testPassword');
    await page.fill('input#exampleInputPhone1', '33333333');
    await page.fill('input#exampleInputaddress1', 'NUS SoC, Singapore');
    await page.fill('input#exampleInputDOB1', '2025-01-01');
    await page.fill('input#exampleInputanswer1', 'Test');

    await page.click('button:has-text("REGISTER")');

    await expect(page).toHaveURL('http://localhost:3000/login');
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(uniqueEmail1);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("testPassword");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByText("Profile")).toBeVisible();
    await expect(page.getByText("Orders")).toBeVisible();

    const nameElement1 = await page.getByTestId('name').textContent();
    expect(nameElement1).toBe('John Doe');

    const emailElement1 = await page.getByTestId('email').textContent();
    expect(emailElement1).toBe(uniqueEmail1);

    const addressElement1 = await page.getByTestId('address').textContent();
    expect(addressElement1).toBe('NUS SoC, Singapore');

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

    // NEW USER
    await page.goto('http://localhost:3000/register', {waitUntil: "commit"});
    uniqueEmail2 = `testregister${Date.now()}@gmail.com`;  

    await page.fill('input#exampleInputName1', 'Another User');
    await page.fill('input#exampleInputEmail1', uniqueEmail2); 
    await page.fill('input#exampleInputPassword1', 'testPassword');
    await page.fill('input#exampleInputPhone1', '11111111');
    await page.fill('input#exampleInputaddress1', 'NUS Street, Singapore');
    await page.fill('input#exampleInputDOB1', '2025-02-02');
    await page.fill('input#exampleInputanswer1', 'Test');

    await page.click('button:has-text("REGISTER")');

    await expect(page).toHaveURL('http://localhost:3000/login');
    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill(uniqueEmail2);
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("testPassword");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "Another User" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await expect(page.getByText("Profile")).toBeVisible();
    await expect(page.getByText("Orders")).toBeVisible();

    const nameElement2 = await page.getByTestId('name').textContent();
    expect(nameElement2).toBe('Another User'); // should not be John Doe

    const emailElement2 = await page.getByTestId('email').textContent();
    expect(emailElement2).toBe(uniqueEmail2);

    const addressElement2 = await page.getByTestId('address').textContent();
    expect(addressElement2).toBe('NUS Street, Singapore'); // should not be NUS Soc, Singapore
  });

  test.afterEach(async () => {
    if (uniqueEmail) {
      console.log(`Deleting test user account: ${uniqueEmail}`);
      await deleteUserByEmail(uniqueEmail);
    }
    if (uniqueEmail1) {
      console.log(`Deleting test user account: ${uniqueEmail1}`);
      await deleteUserByEmail(uniqueEmail1);
    }
    if (uniqueEmail2) {
      console.log(`Deleting test user account: ${uniqueEmail2}`);
      await deleteUserByEmail(uniqueEmail2);
    }
  });
});