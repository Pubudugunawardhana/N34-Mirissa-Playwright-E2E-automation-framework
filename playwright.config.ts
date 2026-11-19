import path from 'path';
import { defineConfig, devices } from '@playwright/test';
import { env } from './utils/env';
import { ADMIN_AUTH_FILE, GUEST_AUTH_FILE } from './utils/constants';

const PORT = new URL(env.baseURL).port || '3100';
const resetScript = path.join(__dirname, 'scripts', 'reset-db.mjs');

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright', { resultsDir: 'allure-results' }]],

  use: {
    baseURL: env.baseURL,
    headless: true,
    // The home page fades sections in on scroll; reduced motion shows them straight away.
    contextOptions: { reducedMotion: 'reduce' },
    locale: 'en-GB',
    timezoneId: 'Asia/Colombo',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  // Resets and seeds the test database, then builds and starts N34 Mirissa against it.
  webServer: {
    command: `node "${resetScript}" && npm run build && npx next start -p ${PORT}`,
    cwd: env.appDir,
    url: env.baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    stdout: 'ignore',
    stderr: 'pipe',
    env: {
      DATABASE_URL: env.testDatabaseUrl,
      AUTH_SECRET: env.authSecret,
      AUTH_TRUST_HOST: 'true',
      APP_URL: env.baseURL,
      // Tokens are stored hashed and the link only goes to the server console, so tests skip verification.
      REQUIRE_EMAIL_VERIFICATION: 'false',
      // No real emails or photo uploads from tests.
      GMAIL_USER: '',
      GMAIL_APP_PASSWORD: '',
      CLOUDINARY_CLOUD_NAME: '',
      CLOUDINARY_API_KEY: '',
      CLOUDINARY_API_SECRET: '',
    },
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Everyday specs. Each spec picks the session it needs (guest, admin or signed out).
    // Desktop projects leave out @mobile-only tests (phone-only UI such as the menu button).
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: GUEST_AUTH_FILE },
      dependencies: ['setup'],
      grepInvert: /@mobile-only/,
      testIgnore: /maintenance\.spec\.ts/,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: GUEST_AUTH_FILE },
      dependencies: ['setup'],
      grepInvert: /@mobile-only/,
      testIgnore: /maintenance\.spec\.ts/,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: GUEST_AUTH_FILE },
      dependencies: ['setup'],
      grepInvert: /@mobile-only/,
      testIgnore: /maintenance\.spec\.ts/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], storageState: GUEST_AUTH_FILE },
      dependencies: ['setup'],
      grep: /@mobile|@smoke/,
      testIgnore: /maintenance\.spec\.ts/,
    },

    // Site-wide switches (maintenance mode, paused booking) change what every other test sees,
    // so they run on their own, one at a time, after the main Chromium run.
    {
      name: 'settings',
      use: { ...devices['Desktop Chrome'], storageState: ADMIN_AUTH_FILE },
      testMatch: /maintenance\.spec\.ts/,
      dependencies: ['chromium'],
      fullyParallel: false,
    },
  ],
});
