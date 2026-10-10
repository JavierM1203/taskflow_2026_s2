import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './client/e2e/tests',
  outputDir: './client/e2e/test-results',
  fullyParallel: true,
  reporter: 'list',
  globalSetup: './client/e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev:server',
      url: 'http://localhost:3000/api/health',
      env: { DATABASE_URL: 'file:./e2e.db' },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev:client',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
