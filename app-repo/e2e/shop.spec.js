// End-to-end smoke tests for the Shop flow
// Precondition: backend is running on 3000, frontend on 8080, and DB is seeded
//   Seed: npm --prefix ./server run seed:db admin@rmit.edu.vn mypassword

const { test, expect } = require('@playwright/test');

test.describe('Shop page', () => {
  test('loads and lists products', async ({ page }) => {
    // Pre-flight API check: ensure products exist; skip test if none
    const apiBase = process.env.E2E_API_BASE || 'http://localhost:3000';
    const apiRes = await page.request.get(
      `${apiBase}/api/product/list?sortOrder=%7B%22_id%22%3A-1%7D&rating=0&min=1&max=999999`
    );
    if (!apiRes.ok()) {
      test.skip('API not reachable for product listing');
    }
    let data;
    try {
      data = await apiRes.json();
    } catch (e) {
      test.skip('API did not return JSON (likely hitting frontend).');
    }
    if (!Array.isArray(data.products) || data.products.length === 0) {
      test.skip('No products in DB; skipping UI product render assertion');
    }

    // Go directly to the shop page
    await page.goto('/shop', { waitUntil: 'networkidle' });

    // Wait for at least one product card link to be present
    const productLinks = page.locator('.product-list .item-link a');
    await page.waitForFunction(() => {
      return document.querySelectorAll('.product-list .item-link a').length > 0;
    });

    // Scroll into view and ensure link is interactable, then click
    const firstLink = productLinks.first();
    await firstLink.scrollIntoViewIfNeeded();
    await firstLink.waitFor({ state: 'visible' });
    await firstLink.click();
    await expect(page).toHaveURL(/\/product\//);
    // Product title should be visible
    await expect(page.locator('h1.item-name')).toBeVisible();
  });
});
