const { test, expect } = require('@playwright/test');
const dotenv = require('dotenv');
dotenv.config();

test.describe.serial('Dashboard Page Tests', () => {

  let uniqueEmail;

  test('New order placed should default to Not Processed', async ({ page }) => {
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

    expect.poll(
      async () => {
        return await page.getByText("more details").count();
      },
      {
        timeout: 10000,
        message: "Waiting for all products to load",
      }
    );

    await page.locator(".card").filter({ hasText: /Smartphone/ }).first().getByText("Add to cart").click({ timeout: 10000 });
    await page.getByRole("link", { name: "Cart" }).click();

    await page.getByRole("button", { name: "Paying with Card" }).click();
    const creditCardField = page
      .locator('iframe[name="braintree-hosted-field-number"]')
      .contentFrame()
      .getByRole("textbox", { name: "Credit Card Number" });
    await expect(creditCardField).toBeVisible({ timeout: 10000 });
    await creditCardField.fill("4111111111111111");
    await page
      .locator('iframe[name="braintree-hosted-field-expirationDate"]')
      .contentFrame()
      .getByRole("textbox", { name: "Expiration Date" })
      .fill("10/29");

    await page
      .locator('iframe[name="braintree-hosted-field-cvv"]')
      .contentFrame()
      .getByRole("textbox", { name: "CVV" })
      .fill("111");

    await page.getByText("Make Payment").click();
    await expect(
      page.getByText("Payment Completed Successfully")
    ).toBeVisible();
    await expect(page.getByText("All Orders")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Not Processed")).toBeVisible();
  });

  test('should update the user order status to Processing once its been updated by the admin', async ({ page }) => {
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

    expect.poll(
      async () => {
        return await page.getByText("more details").count();
      },
      {
        timeout: 10000,
        message: "Waiting for all products to load",
      }
    );

    await page.locator(".card").filter({ hasText: /Smartphone/ }).first().getByText("Add to cart").click({ timeout: 10000 });
    await page.getByRole("link", { name: "Cart" }).click();

    await page.getByRole("button", { name: "Paying with Card" }).click();
    const creditCardField = page
      .locator('iframe[name="braintree-hosted-field-number"]')
      .contentFrame()
      .getByRole("textbox", { name: "Credit Card Number" });
    await expect(creditCardField).toBeVisible({ timeout: 10000 });
    await creditCardField.fill("4111111111111111");
    await page
      .locator('iframe[name="braintree-hosted-field-expirationDate"]')
      .contentFrame()
      .getByRole("textbox", { name: "Expiration Date" })
      .fill("10/29");

    await page
      .locator('iframe[name="braintree-hosted-field-cvv"]')
      .contentFrame()
      .getByRole("textbox", { name: "CVV" })
      .fill("111");

    await page.getByText("Make Payment").click();
    await expect(
      page.getByText("Payment Completed Successfully")
    ).toBeVisible();
    await expect(page.getByText("All Orders")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Not Processed")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("cs4218@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText('Smartphone', { exact: true }).nth(1)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Not Processed' }).locator('div').first()).toBeVisible();
    await page.locator('td:nth-child(2)').first().click();
    await page.locator('.rc-virtual-list-holder-inner > div:nth-child(2)').click();
    
    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

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

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Processing")).toBeVisible({ timeout: 10000 });
  });

  test('should update the user order status to Shipped once its been updated by the admin', async ({ page }) => {
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

    expect.poll(
      async () => {
        return await page.getByText("more details").count();
      },
      {
        timeout: 10000,
        message: "Waiting for all products to load",
      }
    );

    await page.locator(".card").filter({ hasText: /Smartphone/ }).first().getByText("Add to cart").click({ timeout: 10000 });
    await page.getByRole("link", { name: "Cart" }).click();

    await page.getByRole("button", { name: "Paying with Card" }).click();
    const creditCardField = page
      .locator('iframe[name="braintree-hosted-field-number"]')
      .contentFrame()
      .getByRole("textbox", { name: "Credit Card Number" });
    await expect(creditCardField).toBeVisible({ timeout: 10000 });
    await creditCardField.fill("4111111111111111");
    await page
      .locator('iframe[name="braintree-hosted-field-expirationDate"]')
      .contentFrame()
      .getByRole("textbox", { name: "Expiration Date" })
      .fill("10/29");

    await page
      .locator('iframe[name="braintree-hosted-field-cvv"]')
      .contentFrame()
      .getByRole("textbox", { name: "CVV" })
      .fill("111");

    await page.getByText("Make Payment").click();
    await expect(
      page.getByText("Payment Completed Successfully")
    ).toBeVisible();
    await expect(page.getByText("All Orders")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Not Processed")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("cs4218@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText('Smartphone', { exact: true }).nth(1)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Not Processed' }).locator('div').first()).toBeVisible();
    await page.locator('td:nth-child(2)').first().click();
    await page.locator('.rc-virtual-list-holder-inner > div:nth-child(3)').click();
    
    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

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

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Shipped")).toBeVisible({ timeout: 10000 });
  });

  test('should update the user order status to Delivered once its been updated by the admin', async ({ page }) => {
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

    expect.poll(
      async () => {
        return await page.getByText("more details").count();
      },
      {
        timeout: 10000,
        message: "Waiting for all products to load",
      }
    );

    await page.locator(".card").filter({ hasText: /Smartphone/ }).first().getByText("Add to cart").click({ timeout: 10000 });
    await page.getByRole("link", { name: "Cart" }).click();

    await page.getByRole("button", { name: "Paying with Card" }).click();
    const creditCardField = page
      .locator('iframe[name="braintree-hosted-field-number"]')
      .contentFrame()
      .getByRole("textbox", { name: "Credit Card Number" });
    await expect(creditCardField).toBeVisible({ timeout: 10000 });
    await creditCardField.fill("4111111111111111");
    await page
      .locator('iframe[name="braintree-hosted-field-expirationDate"]')
      .contentFrame()
      .getByRole("textbox", { name: "Expiration Date" })
      .fill("10/29");

    await page
      .locator('iframe[name="braintree-hosted-field-cvv"]')
      .contentFrame()
      .getByRole("textbox", { name: "CVV" })
      .fill("111");

    await page.getByText("Make Payment").click();
    await expect(
      page.getByText("Payment Completed Successfully")
    ).toBeVisible();
    await expect(page.getByText("All Orders")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Not Processed")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("cs4218@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText('Smartphone', { exact: true }).nth(1)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Not Processed' }).locator('div').first()).toBeVisible();
    await page.locator('td:nth-child(2)').first().click();
    await page.locator('.rc-virtual-list-holder-inner > div:nth-child(4)').click();
    
    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

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

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Delivered")).toBeVisible({ timeout: 10000 });
  });

  test('should update the user order status to Cancelled once its been updated by the admin', async ({ page }) => {
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

    expect.poll(
      async () => {
        return await page.getByText("more details").count();
      },
      {
        timeout: 10000,
        message: "Waiting for all products to load",
      }
    );

    await page.locator(".card").filter({ hasText: /Smartphone/ }).first().getByText("Add to cart").click({ timeout: 10000 });
    await page.getByRole("link", { name: "Cart" }).click();

    await page.getByRole("button", { name: "Paying with Card" }).click();
    const creditCardField = page
      .locator('iframe[name="braintree-hosted-field-number"]')
      .contentFrame()
      .getByRole("textbox", { name: "Credit Card Number" });
    await expect(creditCardField).toBeVisible({ timeout: 10000 });
    await creditCardField.fill("4111111111111111");
    await page
      .locator('iframe[name="braintree-hosted-field-expirationDate"]')
      .contentFrame()
      .getByRole("textbox", { name: "Expiration Date" })
      .fill("10/29");

    await page
      .locator('iframe[name="braintree-hosted-field-cvv"]')
      .contentFrame()
      .getByRole("textbox", { name: "CVV" })
      .fill("111");

    await page.getByText("Make Payment").click();
    await expect(
      page.getByText("Payment Completed Successfully")
    ).toBeVisible();
    await expect(page.getByText("All Orders")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Not Processed")).toBeVisible();

    await page.getByRole("button", { name: "John Doe" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

    await page
      .getByRole("textbox", { name: "Enter Your Email" })
      .fill("cs4218@test.com");
    await page
      .getByRole("textbox", { name: "Enter Your Password" })
      .fill("cs4218@test.com");
    await page.getByRole("button", { name: "LOGIN" }).click();

    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Dashboard" }).click();
    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText('Smartphone', { exact: true }).nth(1)).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Not Processed' }).locator('div').first()).toBeVisible();
    await page.locator('td:nth-child(2)').first().click();
    await page.locator('.rc-virtual-list-holder-inner > div:nth-child(5)').click();
    
    await page.getByRole("button", { name: "CS 4218 TEST ACCOUNT" }).click();
    await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
    await page.getByRole("link", { name: "Logout" }).click();

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

    await page.getByRole("link", { name: "Orders" }).click();
    await expect(page.getByText("A high-end smartphone")).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Cancelled")).toBeVisible({ timeout: 10000 });
  });
});