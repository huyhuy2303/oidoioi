// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:8080';
const startServers = !process.env.E2E_EXTERNAL; // set to skip starting dev servers

module.exports = defineConfig({
  testDir: 'e2e',
  // Allow more time for first load and dev server startup on slower machines
  timeout: 90 * 1000,
  globalSetup: require.resolve('./e2e/global.setup.js'),
  expect: { timeout: 10 * 1000 },
  retries: 0,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }
  ],
  // Start backend and frontend separately so failures don't kill both
  webServer: startServers
    ? [
        {
          command: 'npm --prefix ./server run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
          timeout: 120 * 1000,
          env: { E2E: '1' }
        },
        {
          command: 'npm --prefix ./client run dev',
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120 * 1000,
          env: { E2E: '1' }
        }
      ]
    : undefined
});
