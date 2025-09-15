const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@rmit.edu.vn';
const ADMIN_PASS = process.env.E2E_ADMIN_PASS || 'mypassword';
const API_BASE = process.env.E2E_API_BASE || 'http://localhost:3000';

async function ensureProducts(page) {
  const res = await page.request.get(
    `${API_BASE}/api/product/list?sortOrder=%7B%22_id%22%3A-1%7D&rating=0&min=1&max=999999`
  );
  if (!res.ok()) test.skip('API not reachable for product listing');
  const data = await res.json();
  if (!Array.isArray(data.products) || data.products.length === 0) {
    test.skip('No products to test add-to-cart');
  }
}

async function goToFirstProduct(page) {
  await page.goto('/shop', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => {
    return document.querySelectorAll('.product-list .item-link a').length > 0;
  });
  const first = page.locator('.product-list .item-link a').first();
  await first.click();
  await expect(page).toHaveURL(/\/product\//);
}

test.describe('Cart + Checkout', () => {
  test('unauthenticated: add to cart then proceed to checkout -> redirects to login', async ({ page }) => {
    await ensureProducts(page);
    // Must be on our origin before touching localStorage
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => localStorage.removeItem('token'));

    await goToFirstProduct(page);

    // Add to bag
    const addBtn = page.getByRole('button', { name: 'Add To Bag' });
    await addBtn.click();

    // Cart opens automatically; click Proceed To Checkout
    await page.getByRole('button', { name: 'Proceed To Checkout' }).click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated: add to cart then place order -> success page', async ({ page }) => {
    await ensureProducts(page);

    // Login first
    await page.goto('/login');
    const form = page.locator('.login-form').locator('form');
    await form.getByPlaceholder('Enter Your Email Address').fill(ADMIN_EMAIL);
    await form.getByPlaceholder('Enter Your Password').fill(ADMIN_PASS);
    await form.getByRole('button', { name: 'Sign In' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Go to a product and add to bag
    await goToFirstProduct(page);
    await page.getByRole('button', { name: 'Add To Bag' }).click();

    // Place order
    await page.getByRole('button', { name: 'Place Order' }).click();

    // Expect success page
    await expect(page).toHaveURL(/\/order\/success\//);
  });
});
