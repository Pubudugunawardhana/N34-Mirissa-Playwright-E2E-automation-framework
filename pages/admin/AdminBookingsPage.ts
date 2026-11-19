import type { Locator, Page } from '@playwright/test';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export type RecordsView = 'upcoming' | 'past' | 'cancelled' | 'all';

/**
 * The admin booking screens: /admin/bookings ("New Bookings") and /admin/bookings/records ("Booking Records").
 * Both use the same list (src/components/admin/BookingList.tsx).
 */
export class AdminBookingsPage {
  readonly heading: Locator;
  readonly sidebar: Locator;
  readonly searchInput: Locator;
  readonly bookingRows: Locator;
  readonly recordTabs: Locator;
  readonly emptyState: Locator;
  readonly assignDialog: Locator;
  readonly markPaidDialog: ConfirmDialog;
  readonly cancelDialog: ConfirmDialog;

  constructor(readonly page: Page) {
    this.heading = page.getByRole('heading', { level: 1 });
    this.sidebar = page.locator('aside');
    this.searchInput = page.getByRole('searchbox', { name: 'Search bookings' });
    this.bookingRows = page.locator('main ul > li');
    this.recordTabs = page.locator('main').getByRole('link', { name: /^(Upcoming|Past|Cancelled|All)\b/ });
    this.emptyState = page.locator('main').getByText(/No bookings match|No new bookings/);
    this.assignDialog = page.getByRole('dialog', { name: 'Assign a room' });
    this.markPaidDialog = new ConfirmDialog(page, 'Mark as paid?');
    this.cancelDialog = new ConfirmDialog(page, 'Cancel this booking?');
  }

  async gotoNewBookings() {
    await this.page.goto('/admin/bookings');
  }

  async gotoRecords(view: RecordsView = 'upcoming', search?: string) {
    const query = new URLSearchParams();
    if (view !== 'upcoming') query.set('view', view);
    if (search) query.set('q', search);
    await this.page.goto(`/admin/bookings/records${query.size ? `?${query}` : ''}`);
  }

  /** Types into the live search; the list updates after a short pause in typing. */
  async search(text: string) {
    await this.searchInput.fill(text);
  }

  bookingRow(reference: string): Locator {
    return this.bookingRows.filter({ hasText: reference });
  }

  /** "Assign room" → keep the preselected free room → "Assign & confirm". */
  async assignRoom(reference: string) {
    await this.bookingRow(reference).getByRole('button', { name: 'Assign room' }).click();
    await this.assignDialog.getByRole('button', { name: 'Assign & confirm' }).click();
  }

  async markPaid(reference: string) {
    await this.bookingRow(reference).getByRole('button', { name: 'Mark paid' }).click();
    await this.markPaidDialog.confirm('Mark paid');
  }

  async cancel(reference: string) {
    await this.bookingRow(reference).getByRole('button', { name: 'Cancel booking' }).click();
    await this.cancelDialog.confirm('Cancel booking');
  }

  sidebarLink(name: string): Locator {
    return this.sidebar.getByRole('link', { name });
  }
}
