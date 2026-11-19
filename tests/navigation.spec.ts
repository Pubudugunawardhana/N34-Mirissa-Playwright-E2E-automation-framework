import { test, expect } from '../fixtures/pageFixtures';
import { labelTest, Severity } from '../utils/allure';
import { SIGNED_OUT } from '../utils/constants';
import testData from '../data/testData.json';

test.use({ storageState: SIGNED_OUT });

const NAV_LINKS = [
  { name: 'Rooms', path: '/rooms' },
  { name: 'Experiences', path: '/experiences' },
  { name: 'Dining', path: '/dining' },
  { name: 'Contact', path: '/contact' },
] as const;

test.describe('Navigation', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  for (const link of NAV_LINKS) {
    test(`TC01 - Nav link "${link.name}" opens ${link.path} and is marked as current`, async ({
      page,
      homePage,
      isMobile,
    }) => {
      test.skip(isMobile, 'The desktop nav links are in the menu on phones (covered by TC05).');
      await labelTest({ feature: 'Navigation', story: 'Main menu', severity: Severity.CRITICAL });

      await test.step(`Click "${link.name}"`, async () => {
        await homePage.nav.link(link.name).click();
      });

      await test.step('Verify the page and the active link', async () => {
        await expect(page).toHaveURL(new RegExp(`${link.path}$`));
        await expect(homePage.nav.link(link.name)).toHaveAttribute('aria-current', 'page');
        await expect(homePage.nav.link('Home')).not.toHaveAttribute('aria-current', 'page');
        await expect(homePage.heading).toBeVisible();
      });
    });
  }

  test('TC02 - Theme toggle switches to dark mode and remembers it', { tag: '@mobile' }, async ({ page, homePage }) => {
    await labelTest({ feature: 'Navigation', story: 'Dark mode', severity: Severity.MINOR });

    await test.step('Switch to dark mode', async () => {
      await homePage.nav.themeToggle.click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(homePage.nav.themeToggle).toHaveAccessibleName('Switch to light mode');
    });

    await test.step('Verify the choice is saved in a cookie and survives a reload', async () => {
      const cookies = await page.context().cookies();
      expect(cookies.find((cookie) => cookie.name === 'theme')?.value).toBe('dark');
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });
  });

  test('TC03 - Footer guest links point to the right pages', async ({ homePage }) => {
    await labelTest({ feature: 'Navigation', story: 'Footer', severity: Severity.NORMAL });

    const expected = {
      'Book a room': '/rooms',
      'Find my booking': '/book/find',
      'My account': '/user',
      'Sign in': '/login',
      'Create account': '/register',
    };
    for (const [name, href] of Object.entries(expected)) {
      await expect(homePage.footer.guestLink(name), name).toHaveAttribute('href', href);
    }
    await expect(homePage.footer.exploreLinks).toHaveText([
      'Home',
      'Rooms',
      'Experiences',
      'Dining',
      'Weddings',
      'Contact',
    ]);
  });

  test('TC04 - Unknown address shows the "Page not found" page', { tag: '@mobile' }, async ({ page, homePage }) => {
    await labelTest({ feature: 'Navigation', story: 'Not found page', severity: Severity.MINOR });

    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(homePage.heading).toHaveText(testData.messages.notFound);
  });

  test('TC05 - Mobile menu opens and navigates', { tag: '@mobile' }, async ({ page, homePage, isMobile }) => {
    test.skip(!isMobile, 'The menu button only shows on small screens.');
    await labelTest({ feature: 'Navigation', story: 'Mobile menu', severity: Severity.NORMAL });

    await test.step('Open the menu', async () => {
      await homePage.nav.openMobileMenu();
      await expect(homePage.nav.root.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
        'aria-expanded',
        'true',
      );
    });

    await test.step('Go to Dining from the menu', async () => {
      await homePage.nav.link('Dining').click();
      await expect(page).toHaveURL(/\/dining$/);
    });
  });
});
