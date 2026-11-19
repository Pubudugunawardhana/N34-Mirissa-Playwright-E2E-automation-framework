import { test, expect } from '../fixtures/pageFixtures';
import { registerAndSignIn } from '../fixtures/flows';
import { labelTest, Severity } from '../utils/allure';
import { env } from '../utils/env';
import { SIGNED_OUT } from '../utils/constants';
import { savedGuestUser } from '../utils/guestUser';
import { newGuestUser } from '../utils/testUser';
import testData from '../data/testData.json';

// Sign-up and sign-in tests start signed out.
test.use({ storageState: SIGNED_OUT });

test.describe('Authentication', () => {
  test(
    'TC24 - New guest registers and signs in',
    { tag: '@smoke' },
    async ({ page, registerPage, loginPage, accountPage }) => {
      await labelTest({ feature: 'Authentication', story: 'Register', severity: Severity.BLOCKER });

      const user = await registerAndSignIn({ registerPage, loginPage }, 'register');

      await test.step('Verify the account page greets the new guest', async () => {
        await page.goto('/user');
        await expect(accountPage.heading).toHaveText(`Welcome, ${user.name}`);
        await expect(accountPage.bookingsTab).toBeVisible();
      });
    },
  );

  for (const scenario of testData.registerErrorScenarios) {
    test(`TC25 - Registration fails with ${scenario.title}`, async ({ registerPage }) => {
      await labelTest({ feature: 'Authentication', story: 'Register validation', severity: Severity.CRITICAL });
      const { email } = newGuestUser('invalid');

      await registerPage.goto();
      await registerPage.register({ ...scenario, email });

      await expect(registerPage.fieldError(scenario.field as 'name' | 'password' | 'confirmPassword')).toHaveText(
        scenario.error,
      );
      await expect(registerPage.formError).toHaveText('Please fix the highlighted fields.');
    });
  }

  test('TC26 - Registration fails for an email that already has an account', async ({ registerPage }) => {
    await labelTest({ feature: 'Authentication', story: 'Register validation', severity: Severity.NORMAL });
    const existing = savedGuestUser();

    await registerPage.goto();
    await registerPage.register({ ...newGuestUser(), email: existing.email });
    await expect(registerPage.fieldError('email')).toHaveText('An account with this email already exists.');
  });

  // Data-driven: a null email means "use the guest account made during setup".
  for (const scenario of testData.loginErrorScenarios) {
    test(`TC27 - Sign-in fails with ${scenario.title}`, async ({ loginPage }) => {
      await labelTest({ feature: 'Authentication', story: 'Login validation', severity: Severity.CRITICAL });

      await loginPage.goto();
      await loginPage.login(scenario.email ?? savedGuestUser().email, scenario.password);
      await expect(loginPage.errorMessage).toHaveText(scenario.error);
      await expect(loginPage.page).toHaveURL(/\/login/);
    });
  }

  test('TC28 - Staff accounts cannot sign in on the guest page', async ({ loginPage }) => {
    await labelTest({ feature: 'Authentication', story: 'Login validation', severity: Severity.CRITICAL });

    await loginPage.goto();
    await loginPage.login(env.adminUsername, env.adminPassword);
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password.');
  });

  test('TC29 - My account needs sign-in and returns there afterwards', async ({ page, loginPage, accountPage }) => {
    await labelTest({ feature: 'Authentication', story: 'Protected pages', severity: Severity.CRITICAL });
    const guest = savedGuestUser();

    await test.step('Open /user while signed out', async () => {
      await page.goto('/user');
      await expect(page).toHaveURL(/\/login\?callbackUrl=/);
    });

    await test.step('Sign in and land back on the account page', async () => {
      await loginPage.login(guest.email, guest.password);
      await expect(page).toHaveURL(/\/user$/);
      await expect(accountPage.heading).toHaveText(`Welcome, ${guest.name}`);
    });
  });

  test('TC30 - Signed-in guest can sign out', async ({ page, loginPage, homePage, isMobile }) => {
    test.skip(isMobile, 'Sign Out sits in the menu on phones.');
    await labelTest({ feature: 'Authentication', story: 'Logout', severity: Severity.NORMAL });
    const guest = savedGuestUser();

    await loginPage.goto();
    await loginPage.login(guest.email, guest.password);
    await expect(homePage.nav.signOut).toBeVisible();

    await homePage.nav.signOut.click();
    await expect(homePage.nav.signUp).toBeVisible();
    await page.goto('/user');
    await expect(page).toHaveURL(/\/login/);
  });
});
