// @ts-check
const { test, expect } = require("@playwright/test");
const { TestEnvironment } = require("jest-environment-jsdom");

const loginFlow = async (page, email, name) => {
  // Login flow
  await page.goto("http://localhost:3000/");
  await page.getByRole("link", { name: "Login" }).click();
  await page.getByRole("textbox", { name: "Enter Your Email" }).fill(email);
  await page.getByRole("textbox", { name: "Enter Your Password" }).fill(email);
  await page.getByRole("button", { name: "LOGIN" }).click();

  // Navigate to dashboard flow
  await page.getByRole("button", { name: name }).click();
  await expect(page.getByRole("link", { name: "Logout" })).toBeVisible();
  await page.getByRole("link", { name: "Dashboard" }).click();

  const profileLink = page.getByRole("link", { name: "Profile" });
  // Check dashboard panel
  await expect(profileLink).toBeVisible();

  // Navigate to profile page
  await profileLink.click();
  await expect(page.getByText("USER PROFILE")).toBeVisible();
};

const fillForm = async (page, updateUser) => {
  // Fill up new data
  await page.getByPlaceholder("Enter Your Name").fill(updateUser.name);
  await page.getByPlaceholder("Enter Your Email").fill(updateUser.email);
  await page.getByPlaceholder("Enter Your Password").fill(updateUser.password);
  await page.getByPlaceholder("Enter Your Phone").fill(updateUser.phone);
  await page.getByPlaceholder("Enter Your Address").fill(updateUser.address);

  await page.getByText("UPDATE").click();
  await expect(page.getByText("Profile Updated Successfully")).toBeVisible();
  await page.reload();
};

test.describe.serial("User profile update", () => {
  test.beforeEach("Navigate to profile", async ({ page }) => {
    await loginFlow(page, originalUser.email, originalUser.name);
  });

  const originalUser = {
    name: "user@test.com",
    email: "user@test.com",
    password: "user@test.com",
    phone: "user@test.com",
    address: "user@test.com",
  };

  test("User updates profile", async ({ page }) => {
    // Setup user update info
    const updateUser = {
      name: "User test",
      email: "userUpdated@test.com",
      password: "userUpdated@test.com",
      phone: "12345678",
      address: "Test drive",
    };

    // Ensure that the user is loaded
    await expect(page.getByPlaceholder("Enter Your Email")).toHaveValue(
      "user@test.com",
      { timeout: 8000 }
    );

    await fillForm(page, updateUser);

    // Check that the updated information shows up
    await expect(page.getByText(updateUser.name)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByPlaceholder("Enter Your Email")).toHaveValue(
      updateUser.email
    );

    await expect(page.getByPlaceholder("Enter Your Phone")).toHaveValue(
      updateUser.phone
    );
    await expect(page.getByPlaceholder("Enter Your Address")).toHaveValue(
      updateUser.address
    );

    await page.getByRole("button", { name: updateUser.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();

    // Check that we can login with the new email and password
    await loginFlow(page, updateUser.email, updateUser.name);
  });

  test("User updates profile with fields empty", async ({ page }) => {
    // Setup user update info
    const updateUser = {
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
    };

    // Ensure that the user is loaded
    await expect(page.getByPlaceholder("Enter Your Email")).toHaveValue(
      "user@test.com",
      { timeout: 8000 }
    );

    await fillForm(page, updateUser);

    // Check that the original information shows up
    await expect(page.getByText(originalUser.name)).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText(originalUser.email)).toBeVisible();
    await expect(page.getByText(originalUser.phone)).toBeVisible();
    await expect(page.getByText(originalUser.address)).toBeVisible();

    await page.getByRole("button", { name: originalUser.name }).click();
    await page.getByRole("link", { name: "Logout" }).click();

    // Check that we can login with the new email and password
    await loginFlow(page, originalUser.email, originalUser.name);
  });

  test.afterEach(async ({ page }) => {
    // Clean up to revert back to original profile
    // await expect(page.getByPlaceholder("Enter Your Email"));

    await fillForm(page, originalUser);
  });
});
