import type { Locator, Page } from '@playwright/test';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { waitForHydration } from '../utils/hydration';
import { BasePage } from './BasePage';

/** /user — "My bookings" and "Profile settings" for a signed-in guest. */
export class AccountPage extends BasePage {
  protected readonly path = '/user';

  readonly tabs: Locator;
  readonly bookingsTab: Locator;
  readonly profileTab: Locator;

  // My bookings
  readonly bookingCards: Locator;
  readonly cancelDialog: ConfirmDialog;

  // Profile settings
  readonly profileNameInput: Locator;
  readonly profilePhoneInput: Locator;
  readonly profileEmailInput: Locator;
  readonly saveChangesButton: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmNewPasswordInput: Locator;
  readonly changePasswordButton: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.tabs = page.getByRole('navigation', { name: 'Account sections' });
    this.bookingsTab = this.tabs.getByRole('link', { name: 'My bookings' });
    this.profileTab = this.tabs.getByRole('link', { name: 'Profile settings' });

    this.bookingCards = page.locator('main article');
    this.cancelDialog = new ConfirmDialog(page, 'Cancel this booking?');

    this.profileNameInput = page.locator('#profile-name');
    this.profilePhoneInput = page.locator('#profile-phone');
    this.profileEmailInput = page.locator('#profile-email');
    this.saveChangesButton = page.getByRole('button', { name: 'Save changes' });
    this.currentPasswordInput = page.locator('#current-password');
    this.newPasswordInput = page.locator('#new-password');
    this.confirmNewPasswordInput = page.locator('#confirm-new-password');
    this.changePasswordButton = page.getByRole('button', { name: 'Change password' });
    this.successMessage = page.locator('main').getByRole('status').first();
  }

  async gotoProfile() {
    await this.page.goto('/user?tab=profile');
  }

  /** The booking card showing this reference. */
  bookingCard(reference: string): Locator {
    return this.bookingCards.filter({ hasText: reference });
  }

  async cancelBooking(reference: string) {
    await this.bookingCard(reference).getByRole('button', { name: 'Cancel booking' }).click();
    await this.cancelDialog.confirm('Cancel booking');
  }

  async updateProfile({ name, phone }: { name: string; phone: string }) {
    await waitForHydration(this.profileNameInput); // controlled fields
    await this.profileNameInput.fill(name);
    await this.profilePhoneInput.fill(phone);
    await this.saveChangesButton.click();
  }
}
