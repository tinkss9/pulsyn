import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  testIgnore: '**/connectors.spec.ts', // Vitest file, not Playwright
  timeout: 60000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'https://web-lac-nine-aqlw7eo1fc.vercel.app',
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'headed',
      use: { browserName: 'chromium', headless: false },
    },
  ],
  reporter: [['list'], ['html', { open: 'never' }]],
});
