import { test, expect } from '../fixtures/pageFixtures';
import { createGuestBooking, registerAndSignIn } from '../fixtures/flows';
import { labelTest, Severity } from '../utils/allure';
import { SIGNED_OUT } from '../utils/constants';
import { savedGuestUser } from '../utils/guestUser';
import testData from '../data/testData.json';

// These use the guest session saved by tests/auth.setup.ts (the project default).
test.describe('My account', () => {
  test('TC31 - A booking made while signed in shows under My bookings and can be cancelled there', async ({
    page,
    roomsPage,
    roomDetailsPage,
    bookingPage,
    confirmationPage,
    accountPage,
  }) => {
    await labelTest({ feature: 'My account', story: 'My bookings', severity: Severity.CRITICAL });
    const guest = savedGuestUser();

    const booking = await createGuestBooking(
      { roomsPage, roomDetailsPage, bookingPage, confirmationPage },
      { roomName: testData.rooms.family.name, guestName: guest.name, email: guest.email, phone: guest.phone },
    );

    await test.step('Go to My bookings from the confirmation page', async () => {
      await confirmationPage.viewMyBookingsLink.click();
      await expect(page).toHaveURL(/\/user$/);
      await expect(accountPage.bookingCard(booking.reference)).toContainText(testData.rooms.family.name);
      await expect(accountPage.bookingCard(booking.reference)).toContainText('Pending');
    });

    await test.step('Cancel it from the account page', async () => {
      await accountPage.cancelBooking(booking.reference);
      await expect(accountPage.bookingCard(booking.reference)).toContainText('Cancelled');
      await expect(
        accountPage.bookingCard(booking.reference).getByRole('button', { name: 'Cancel booking' }),
      ).toBeHidden();
    });
  });

  test("TC32 - Booking form is pre-filled with the signed-in guest's details", async ({ roomsPage, bookingPage }) => {
    await labelTest({ feature: 'My account', story: 'Pre-filled booking', severity: Severity.NORMAL });
    const guest = savedGuestUser();

    await roomsPage.goto();
    await roomsPage.bookRoom(testData.rooms.deluxe.name);
    await expect(bookingPage.guestNameInput).toHaveValue(guest.name);
    await expect(bookingPage.emailInput).toHaveValue(guest.email);
    await expect(bookingPage.signInLink).toBeHidden();
  });

  test.describe('Profile', () => {
    // Profile changes get a fresh account each time, so tests in other browsers never see each other's edits.
    test.use({ storageState: SIGNED_OUT });

    test('TC33 - Guest updates name and phone, and the change is kept', async ({
      page,
      registerPage,
      loginPage,
      accountPage,
    }) => {
      await labelTest({ feature: 'My account', story: 'Profile settings', severity: Severity.NORMAL });
      await registerAndSignIn({ registerPage, loginPage }, 'profile');
      const updated = { name: 'Kamal Perera', phone: '076 555 1234' };

      await test.step('Save a new name and phone', async () => {
        await accountPage.gotoProfile();
        // updateProfile() waits for React to hydrate the form before typing (see utils/hydration.ts).
        await accountPage.updateProfile(updated);
        await expect(accountPage.successMessage).toHaveText(testData.messages.profileSaved);
      });

      await test.step('Verify the change after a reload', async () => {
        await expect(accountPage.saveChangesButton).toBeEnabled();
        // Reload until the saved values come back (WebKit can serve the page before the save has landed).
        await expect(async () => {
          await page.reload();
          await expect(accountPage.profileNameInput).toHaveValue(updated.name, { timeout: 2_000 });
        }).toPass({ timeout: 20_000 });
        await expect(accountPage.profilePhoneInput).toHaveValue(updated.phone);
        await expect(accountPage.heading).toHaveText(`Welcome, ${updated.name}`);
      });
    });
  });

  test('TC34 - Changing the password needs the right current password', async ({ page, accountPage }) => {
    await labelTest({ feature: 'My account', story: 'Change password', severity: Severity.NORMAL });

    await accountPage.gotoProfile();
    await accountPage.currentPasswordInput.fill('NotMyPassword1');
    await accountPage.newPasswordInput.fill('NewMirissa2026!');
    await accountPage.confirmNewPasswordInput.fill('NewMirissa2026!');
    await accountPage.changePasswordButton.click();
    await expect(page.locator('#current-password-error')).toHaveText('That password is not correct');
  });
});
