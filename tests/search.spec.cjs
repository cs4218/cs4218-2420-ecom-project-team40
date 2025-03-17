const { test, expect } = require('@playwright/test');


test.describe('Search page Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000', {waitUntil: "commit"});
    });

    test('should not do anything if field is empty', async ({ page }) => {
        await page.getByRole('searchbox', { name: 'Search' }).fill('');
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page).toHaveURL('http://localhost:3000');
    });

    test('should find nothing if field does not match', async ({ page }) => {
        await page.getByRole('searchbox', { name: 'Search' }).fill('totalNonsense');
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page.locator('h6')).toContainText('No Products Found');
    });

    test('Should find an existing product with valid search', async ({ page }) => {
        await page.getByRole('searchbox', { name: 'Search' }).fill('Law of Contract');
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page.locator('h6')).toContainText('Found');
        await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');
    });

    test('should go to product page from search results', async ({ page }) => {
        await page.getByRole('searchbox', { name: 'Search' }).fill('Law of Contract');
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page.locator('h6')).toContainText('Found');
        await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');

        await page.getByRole('button', { name: 'More Details' }).click();

        await expect(page).toHaveURL('http://localhost:3000/product/the-law-of-contract-in-singapore');
    });

    test('should add product to cart from search results', async ({ page }) => {
        await page.getByRole('searchbox', { name: 'Search' }).fill('Law of Contract');
        await page.getByRole('button', { name: 'Search' }).click();

        await expect(page.locator('h6')).toContainText('Found');
        await expect(page.getByRole('main')).toContainText('The Law of Contract in Singapore');

        await page.getByRole('button', { name: 'ADD TO CART' }).click();
        const errorToast = page.locator('div[role="status"]');
        await errorToast.waitFor({ state: 'visible', timeout: 1000 });
    
        await expect(errorToast).toHaveText('Item Added to cart');
    });
});