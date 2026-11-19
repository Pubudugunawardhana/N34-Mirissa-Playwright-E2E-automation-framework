import type { Browser, Page } from '@playwright/test';
import { test, expect } from '../fixtures/pageFixtures';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { HomePage } from '../pages/HomePage';
import { labelTest, Severity } from '../utils/allure';
import { env } from '../utils/env';
import { ADMIN_AUTH_FILE, SIGNED_OUT } from '../utils/constants';
import testData from '../data/testData.json';

// Runs in the "settings" project only (see playwright.config.ts): these switches change the whole public site.
test.describe.configure({ mode: 'serial' });
test.use({ storageState: ADMIN_AUTH_FILE });

/** A signed-out visitor's page, next to the admin's. */
async function visitorPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ storageState: SIGNED_OUT, baseURL: env.baseURL });
  return context.newPage();
}

/** Reloads until the change shows: the app caches the maintenance flag for about 10 seconds. */
async function eventually(page: Page, path: string, check: () => Promise<void>) {
  await expect(async () => {
    await page.goto(path);
    await check();
  }).toPass({ intervals: [1_000, 2_000, 3_000], timeout: 30_000 });
}

test.describe('Site status switches', { tag: '@settings' }, () => {
  // Whatever happens, leave the site open for the next run.
  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: ADMIN_AUTH_FILE, baseURL: env.baseURL });
    const settings = new AdminSettingsPage(await context.newPage());
    await settings.goto();
    await settings.setSiteStatus({ bookingsPaused: false, maintenance: false });
    await expect(settings.savedMessage).toBeVisible();
    await context.close();
  });

  test('TC49 - Pausing online booking replaces the booking bar for visitors', async ({
    browser,
    adminSettingsPage,
  }) => {
    await labelTest({ feature: 'Site settings', story: 'Pause online booking', severity: Severity.CRITICAL });
    const visitor = await visitorPage(browser);
    const home = new HomePage(visitor);

    await test.step('Admin pauses online booking', async () => {
      await adminSettingsPage.goto();
      await adminSettingsPage.setSiteStatus({ bookingsPaused: true, maintenance: false });
      await expect(adminSettingsPage.savedMessage).toBeVisible();
    });

    await test.step('Visitor sees the paused notice instead of the date picker', async () => {
      await eventually(visitor, '/', async () => {
        await expect(home.bookingPausedNotice).toContainText(testData.messages.bookingPaused, { timeout: 2_000 });
      });
      await expect(home.checkAvailabilityButton).toBeHidden();
    });

    await test.step('Admin turns online booking back on', async () => {
      await adminSettingsPage.setSiteStatus({ bookingsPaused: false, maintenance: false });
      await expect(adminSettingsPage.savedMessage).toBeVisible();
      await eventually(visitor, '/', async () => {
        await expect(home.checkAvailabilityButton).toBeVisible({ timeout: 2_000 });
      });
    });

    await visitor.context().close();
  });

  test('TC50 - Maintenance mode hides the site from visitors but not from staff', async ({
    browser,
    page,
    adminSettingsPage,
  }) => {
    await labelTest({ feature: 'Site settings', story: 'Maintenance mode', severity: Severity.CRITICAL });
    const visitor = await visitorPage(browser);
    const visitorHeading = visitor.getByRole('heading', { level: 1 });

    await test.step('Admin turns maintenance mode on', async () => {
      await adminSettingsPage.goto();
      await adminSettingsPage.setSiteStatus({ bookingsPaused: false, maintenance: true });
      await expect(adminSettingsPage.savedMessage).toBeVisible();
    });

    await test.step('Visitor gets the maintenance page at any address', async () => {
      await eventually(visitor, '/rooms', async () => {
        await expect(visitorHeading).toHaveText(testData.messages.maintenance, { timeout: 2_000 });
      });
      await expect(visitor).toHaveURL(/\/rooms$/);
    });

    await test.step('Admin can still use the site', async () => {
      await page.goto('/rooms');
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our Rooms');
    });

    await test.step('Admin turns maintenance mode off and the site is back', async () => {
      await adminSettingsPage.goto();
      await adminSettingsPage.setSiteStatus({ bookingsPaused: false, maintenance: false });
      await expect(adminSettingsPage.savedMessage).toBeVisible();
      await eventually(visitor, '/rooms', async () => {
        await expect(visitorHeading).toHaveText('Our Rooms', { timeout: 2_000 });
      });
    });

    await visitor.context().close();
  });
});
