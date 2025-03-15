// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Contact privacy flow", () => {
  test("Can navigate to contact and privacy page", async ({ page }) => {
    await page.goto("http://localhost:3000");

    await expect(page.getByText("All Rights Reserved")).toBeVisible();

    // User sees privacy page upon navigation
    const privacyLink = await page.getByRole("link", {
      name: "Privacy Policy",
    });
    await privacyLink.click();
    await expect(
      page.getByRole("heading", { name: "PRIVACY POLICY" })
    ).toBeVisible();
    await expect(
      page.getByText(
        "This website collects data from users for the purposes of facilitating the services rendered by Virtual Vault."
      )
    ).toBeVisible();

    // User sees contact page upon navigation and finds the phone number
    const contactLink = await page.getByRole("link", { name: "Contact" });
    await contactLink.click();
    await expect(page.getByText("Contact us")).toBeVisible();
    await expect(page.getByText("012-3456789")).toBeVisible();
  });
});
