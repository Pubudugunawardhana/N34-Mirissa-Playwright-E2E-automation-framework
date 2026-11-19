import type { Locator, Page } from '@playwright/test';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { BasePage } from './BasePage';

/** /book/confirmation/<id> — "Booking received" right after booking, "Booking details" later. */
export class ConfirmationPage extends BasePage {
  protected readonly path = '/book/confirmation';

  readonly card: Locator;
  readonly reference: Locator;
  readonly bookingStatus: Locator;
  readonly paymentStatus: Locator;
  readonly specialRequests: Locator;
  readonly createAccountLink: Locator;
  readonly viewMyBookingsLink: Locator;
  readonly browseMoreRoomsLink: Locator;
  readonly cancelButton: Locator;
  readonly cancelDialog: ConfirmDialog;

  constructor(page: Page) {
    super(page);
    this.card = page.locator('main');
    // The reference is the line right after the "Booking reference" caption.
    this.reference = this.card
      .locator('p', { hasText: /^Booking reference$/ })
      .locator('xpath=following-sibling::p[1]');
    this.bookingStatus = this.card.getByText(/^(Pending|Confirmed|Cancelled)$/).first();
    this.paymentStatus = this.card.getByText(/^(Unpaid|Part paid|Paid|Refunded)$/).first();
    this.specialRequests = this.card
      .locator('div', { has: page.getByText('Special requests', { exact: true }) })
      .last();
    this.createAccountLink = this.card.getByRole('link', { name: 'Create an account' });
    this.viewMyBookingsLink = this.card.getByRole('link', { name: 'View my bookings' });
    this.browseMoreRoomsLink = this.card.getByRole('link', { name: 'Browse more rooms' });
    this.cancelButton = this.card.getByRole('button', { name: 'Cancel this booking' });
    this.cancelDialog = new ConfirmDialog(page, 'Cancel this booking?');
  }

  async getReference(): Promise<string> {
    return (await this.reference.innerText()).trim();
  }

  /** The booking id, read from the URL. */
  bookingId(): string {
    const match = new URL(this.page.url()).pathname.match(/\/book\/confirmation\/([^/]+)/);
    if (!match) throw new Error(`Not on a confirmation page: ${this.page.url()}`);
    return match[1];
  }

  async cancelBooking() {
    await this.cancelButton.click();
    await this.cancelDialog.confirm('Cancel booking');
  }
}
