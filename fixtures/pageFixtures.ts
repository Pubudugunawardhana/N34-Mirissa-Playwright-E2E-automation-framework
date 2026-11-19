import { test as base } from '@playwright/test';
import { AccountPage } from '../pages/AccountPage';
import { AdminLoginPage } from '../pages/AdminLoginPage';
import { AdminBookingsPage } from '../pages/admin/AdminBookingsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';
import { BookingPage } from '../pages/BookingPage';
import { ConfirmationPage } from '../pages/ConfirmationPage';
import { ContactPage } from '../pages/ContactPage';
import { DiningPage } from '../pages/DiningPage';
import { ExperiencesPage } from '../pages/ExperiencesPage';
import { FindBookingPage } from '../pages/FindBookingPage';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { RoomDetailsPage } from '../pages/RoomDetailsPage';
import { RoomsPage } from '../pages/RoomsPage';

export type Pages = {
  homePage: HomePage;
  roomsPage: RoomsPage;
  roomDetailsPage: RoomDetailsPage;
  bookingPage: BookingPage;
  confirmationPage: ConfirmationPage;
  findBookingPage: FindBookingPage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountPage: AccountPage;
  contactPage: ContactPage;
  diningPage: DiningPage;
  experiencesPage: ExperiencesPage;
  adminLoginPage: AdminLoginPage;
  adminBookingsPage: AdminBookingsPage;
  adminSettingsPage: AdminSettingsPage;
};

/**
 * Extends Playwright's `test` so every test can ask for ready-made page objects:
 *   test('...', async ({ homePage, roomsPage }) => { ... });
 * A page object is only created when a test actually uses it.
 */
export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  roomsPage: async ({ page }, use) => {
    await use(new RoomsPage(page));
  },
  roomDetailsPage: async ({ page }, use) => {
    await use(new RoomDetailsPage(page));
  },
  bookingPage: async ({ page }, use) => {
    await use(new BookingPage(page));
  },
  confirmationPage: async ({ page }, use) => {
    await use(new ConfirmationPage(page));
  },
  findBookingPage: async ({ page }, use) => {
    await use(new FindBookingPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  accountPage: async ({ page }, use) => {
    await use(new AccountPage(page));
  },
  contactPage: async ({ page }, use) => {
    await use(new ContactPage(page));
  },
  diningPage: async ({ page }, use) => {
    await use(new DiningPage(page));
  },
  experiencesPage: async ({ page }, use) => {
    await use(new ExperiencesPage(page));
  },
  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },
  adminBookingsPage: async ({ page }, use) => {
    await use(new AdminBookingsPage(page));
  },
  adminSettingsPage: async ({ page }, use) => {
    await use(new AdminSettingsPage(page));
  },
});

export { expect } from '@playwright/test';
