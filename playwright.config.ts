import { defineConfig, devices } from '@playwright/test';

// Puertos configurables para poder correr los e2e sin chocar con un `npm run dev` ya levantado.
const apiPort = Number(process.env.E2E_API_PORT) || 3000;
const webPort = Number(process.env.E2E_WEB_PORT) || 5173;
const apiOrigin = `http://localhost:${apiPort}`;
const webOrigin = `http://localhost:${webPort}`;

export default defineConfig({
  testDir: './client/e2e/tests',
  outputDir: './client/e2e/test-results',
  fullyParallel: true,
  reporter: 'list',
  globalSetup: './client/e2e/global-setup.ts',
  use: {
    baseURL: webOrigin,
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
      url: `${apiOrigin}/api/health`,
      env: { DATABASE_URL: 'file:./e2e.db', PORT: String(apiPort) },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev:client',
      url: webOrigin,
      env: { VITE_PORT: String(webPort), VITE_API_PROXY: apiOrigin },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
