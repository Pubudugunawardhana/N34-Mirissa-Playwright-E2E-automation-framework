import fs from 'fs';
import path from 'path';
import { test as setup, expect } from '../fixtures/pageFixtures';
import { env } from '../utils/env';
import { labelTest, Severity } from '../utils/allure';
import { ADMIN_AUTH_FILE, GUEST_AUTH_FILE, GUEST_USER_FILE } from '../utils/constants';
import { newGuestUser } from '../utils/testUser';

// The admin must sign in first: on an empty database the app creates the default admin on that page,
// and if a guest registered first, the app would make that guest the admin.
setup.describe.configure({ mode: 'serial' });

setup('authenticate as admin', async ({ page, adminLoginPage }) => {
  await labelTest({ feature: 'Test setup', story: 'Save admin session', severity: Severity.BLOCKER });

  await adminLoginPage.goto();
  await adminLoginPage.login(env.adminUsername, env.adminPassword);
  await expect(page).toHaveURL(/\/admin$/);

  await page.context().storageState({ path: ADMIN_AUTH_FILE });
});

setup('register and authenticate a guest', async ({ page, registerPage, loginPage }) => {
  await labelTest({ feature: 'Test setup', story: 'Save guest session', severity: Severity.BLOCKER });
  const guest = newGuestUser('setup');

  await registerPage.goto();
  await registerPage.register(guest);
  await expect(registerPage.heading).toHaveText('Check your inbox');

  await loginPage.goto();
  await loginPage.login(guest.email, guest.password);
  await expect(page).toHaveURL(env.baseURL + '/');

  await page.context().storageState({ path: GUEST_AUTH_FILE });
  fs.mkdirSync(path.dirname(GUEST_USER_FILE), { recursive: true });
  fs.writeFileSync(GUEST_USER_FILE, JSON.stringify(guest, null, 2));
});
