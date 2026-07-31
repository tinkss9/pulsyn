import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Load .env from project root (two levels up from packages/core)
  envDir: '../..',
  test: {
    globals: true,
    environment: 'node',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/integration/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/'],
    },
  },
});
