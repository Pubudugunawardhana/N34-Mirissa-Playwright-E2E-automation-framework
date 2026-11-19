import type { Locator, Page } from '@playwright/test';
import { SelectMenu } from '../components/SelectMenu';
import { BasePage } from './BasePage';

export class RoomDetailsPage extends BasePage {
  // Room ids are random, so this page is reached by clicking through, or with gotoRoom(id).
  protected readonly path = '/rooms';

  readonly allRoomsLink: Locator;
  readonly bookingForm: Locator;
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly adults: SelectMenu;
  readonly children: SelectMenu;
  readonly bookThisRoomButton: Locator;
  readonly availabilityMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.allRoomsLink = page.getByRole('link', { name: /All rooms/ });
    this.bookingForm = page.locator('#book form');
    this.checkInInput = page.locator('#book #check-in');
    this.checkOutInput = page.locator('#book #check-out');
    this.adults = new SelectMenu(page, 'adults');
    this.children = new SelectMenu(page, 'children');
    this.bookThisRoomButton = page.getByRole('button', { name: 'Book this room' });
    this.availabilityMessage = page.locator('#book [aria-live="polite"]');
  }

  async gotoRoom(roomId: string) {
    await this.page.goto(`/rooms/${roomId}`);
  }

  /** Fills the booking bar and continues to the booking form. */
  async startBooking({
    checkIn,
    checkOut,
    adults,
    children,
  }: {
    checkIn: string;
    checkOut: string;
    adults?: string;
    children?: string;
  }) {
    await this.checkInInput.fill(checkIn);
    await this.checkOutInput.fill(checkOut);
    if (adults) await this.adults.choose(adults);
    if (children) await this.children.choose(children);
    await this.bookThisRoomButton.click();
  }

  /** The room id, read from the current URL (/rooms/<id>). */
  roomId(): string {
    const match = new URL(this.page.url()).pathname.match(/\/rooms\/([^/]+)/);
    if (!match) throw new Error(`Not on a room page: ${this.page.url()}`);
    return match[1];
  }
}
