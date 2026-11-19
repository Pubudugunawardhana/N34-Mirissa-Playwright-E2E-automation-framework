import { test, expect } from '../fixtures/pageFixtures';
import { createGuestBooking } from '../fixtures/flows';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { BookingPage } from '../pages/BookingPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { RoomDetailsPage } from '../pages/RoomDetailsPage';
import { RoomsPage } from '../pages/RoomsPage';
import { labelTest, Severity } from '../utils/allure';
import { env } from '../utils/env';
import { ADMIN_AUTH_FILE, SIGNED_OUT } from '../utils/constants';
import { savedGuestUser } from '../utils/guestUser';
import { uniqueEmail } from '../utils/testUser';
import testData from '../data/testData.json';

test.describe('Admin', { tag: '@admin' }, () => {
  test.describe('Staff sign-in', () => {
    test.use({ storageState: SIGNED_OUT });

    test('TC42 - Admin signs in to the admin panel', async ({ page, adminLoginPage }) => {
      await labelTest({ feature: 'Admin', story: 'Admin login', severity: Severity.BLOCKER });

      await adminLoginPage.goto();
      await adminLoginPage.login(env.adminUsername, env.adminPassword);
      await expect(page).toHaveURL(/\/admin$/);
      await expect(page.locator('aside')).toContainText('Admin');
    });

    test('TC43 - A guest account is refused on the admin sign-in page', async ({ page, adminLoginPage }) => {
      await labelTest({ feature: 'Admin', story: 'Admin login', severity: Severity.CRITICAL });
      const guest = savedGuestUser();

      await adminLoginPage.goto();
      await adminLoginPage.login(guest.email, guest.password);
      await expect(adminLoginPage.errorMessage).toHaveText(testData.messages.adminAccessDenied);
      await expect(page).toHaveURL(/\/admin-login/);
    });

    test('TC44 - Visitors are sent from /admin to the staff sign-in page', async ({ page }) => {
      await labelTest({ feature: 'Admin', story: 'Protected pages', severity: Severity.CRITICAL });

      await page.goto('/admin/bookings');
      await expect(page).toHaveURL(/\/admin-login/);
      await expect(new AdminLoginPage(page).signInButton).toBeVisible();
    });
  });

  test.describe('Bookings', () => {
    test.use({ storageState: ADMIN_AUTH_FILE });

    test('TC45 - Admin confirms a new online booking, then marks it paid', async ({
      browser,
      page,
      adminBookingsPage,
    }) => {
      await labelTest({ feature: 'Admin', story: 'Manage bookings', severity: Severity.BLOCKER });
      const guestEmail = uniqueEmail('admin-flow');

      const booking = await test.step('A visitor books a room online (separate, signed-out browser)', async () => {
        const visitor = await browser.newContext({ storageState: SIGNED_OUT, baseURL: env.baseURL });
        const visitorPage = await visitor.newPage();
        try {
          return await createGuestBooking(
            {
              roomsPage: new RoomsPage(visitorPage),
              roomDetailsPage: new RoomDetailsPage(visitorPage),
              bookingPage: new BookingPage(visitorPage),
              confirmationPage: new ConfirmationPage(visitorPage),
            },
            {
              roomName: testData.rooms.villa.name,
              guestName: 'Admin Flow Guest',
              email: guestEmail,
              phone: '071 999 8888',
            },
          );
        } finally {
          await visitor.close();
        }
      });

      await test.step('Find it under New bookings', async () => {
        await adminBookingsPage.gotoNewBookings();
        await expect(adminBookingsPage.heading).toHaveText('New Bookings');
        await adminBookingsPage.search(booking.reference);
        await expect(adminBookingsPage.bookingRow(booking.reference)).toContainText(guestEmail);
        await expect(adminBookingsPage.bookingRow(booking.reference)).toContainText(testData.rooms.villa.name);
      });

      await test.step('Assign a room, which confirms the booking', async () => {
        await adminBookingsPage.assignRoom(booking.reference);
        await expect(adminBookingsPage.bookingRow(booking.reference)).toBeHidden();
      });

      await test.step('See it as confirmed in Booking records', async () => {
        await adminBookingsPage.gotoRecords('upcoming', booking.reference);
        await expect(adminBookingsPage.bookingRow(booking.reference)).toContainText('Confirmed');
        await expect(adminBookingsPage.bookingRow(booking.reference)).toContainText('Unpaid');
      });

      await test.step('Mark it as paid', async () => {
        await adminBookingsPage.markPaid(booking.reference);
        await expect(adminBookingsPage.bookingRow(booking.reference).getByText('Paid', { exact: true })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Mark unpaid' })).toBeVisible();
      });
    });

    test('TC46 - Booking search with no match says so', async ({ adminBookingsPage }) => {
      await labelTest({ feature: 'Admin', story: 'Search bookings', severity: Severity.MINOR });

      await adminBookingsPage.gotoRecords('all', 'N34-NOPE00');
      await expect(adminBookingsPage.emptyState).toContainText('No bookings match "N34-NOPE00"');
    });

    test('TC47 - Booking record tabs switch the view', async ({ page, adminBookingsPage }) => {
      await labelTest({ feature: 'Admin', story: 'Booking records', severity: Severity.NORMAL });

      await adminBookingsPage.gotoRecords();
      await expect(adminBookingsPage.heading).toHaveText('Booking Records');
      await page
        .locator('main')
        .getByRole('link', { name: /^Cancelled/ })
        .click();
      await expect(page).toHaveURL(/view=cancelled/);
      await expect(page.locator('main').getByRole('link', { name: /^Cancelled/ })).toHaveAttribute(
        'aria-current',
        'page',
      );
    });

    test('TC48 - Admin sidebar links open each section', async ({ page, adminBookingsPage }) => {
      await labelTest({ feature: 'Admin', story: 'Admin navigation', severity: Severity.MINOR });

      await page.goto('/admin');
      for (const [name, path] of [
        ['New bookings', '/admin/bookings'],
        ['Booking records', '/admin/bookings/records'],
        ['Room availability', '/admin/availability'],
      ] as const) {
        await adminBookingsPage.sidebarLink(name).click();
        await expect(page, name).toHaveURL(new RegExp(`${path}$`));
      }
    });
  });
});
