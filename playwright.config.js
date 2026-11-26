// Playwright end-to-end tests. They start their own server on a fresh data folder.
const { defineConfig, devices } = require('@playwright/test');

const PORT = Number(process.env.TEST_PORT || 9152);

module.exports = defineConfig({
  testDir: './tests',
  // The specs share one server and build on each other (setup first), so run them in order.
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 8000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:' + PORT,
    // System Chrome; set PW_CHANNEL= (empty) to use the bundled Chromium instead.
    channel: process.env.PW_CHANNEL === undefined ? 'chrome' : (process.env.PW_CHANNEL || undefined),
    launchOptions: { args: ['--no-sandbox'] },
    viewport: { width: 1400, height: 900 },
    locale: 'de-DE',
    acceptDownloads: true,
    trace: 'retain-on-failure'
  },
  projects: [{ name: 'chrome', use: { ...devices['Desktop Chrome'], viewport: { width: 1400, height: 900 } } }],
  webServer: {
    command: 'node tests/serve.js',
    url: 'http://127.0.0.1:' + PORT + '/api/status',
    env: { PORT: String(PORT), HOST: '127.0.0.1' },
    reuseExistingServer: false,
    timeout: 20000
  }
});
