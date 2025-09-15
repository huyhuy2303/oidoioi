const { test, expect } = require('@playwright/test');

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@rmit.edu.vn';
const ADMIN_PASS = process.env.E2E_ADMIN_PASS || 'mypassword';
const API_BASE = process.env.E2E_API_BASE || 'http://localhost:3000';

test.describe('Auth flow', () => {
  test('login and logout', async ({ page }) => {
    // Ensure API is reachable
    const ping = await page.request.get(`${API_BASE}/api/product/list?sortOrder=%7B%22_id%22%3A-1%7D&rating=0&min=1&max=999999`);
    if (!ping.ok()) test.skip('API not reachable; skipping auth e2e');

    // Go to login page
    await page.goto('/login');

    // Scope to the login form to avoid matching footer inputs
    const form = page.locator('.login-form').locator('form');

    // Fill credentials within the form
    await form.getByPlaceholder('Enter Your Email Address').fill(ADMIN_EMAIL);
    await form.getByPlaceholder('Enter Your Password').fill(ADMIN_PASS);



    // Expect redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Logout (stable): clear token and verify protected route redirects to /login
    await page.waitForLoadState('networkidle');
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/login/);
  });
});
