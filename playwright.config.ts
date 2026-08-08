import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './packages/web/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'https://pulsyn-oitikfy1b-1inai.vercel.app',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
