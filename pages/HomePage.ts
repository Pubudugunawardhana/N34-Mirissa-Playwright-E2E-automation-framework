import type { Locator, Page } from '@playwright/test';
import { SelectMenu } from '../components/SelectMenu';
import { BasePage } from './BasePage';

export type AvailabilitySearch = { checkIn: string; checkOut: string; adults?: string; children?: string };

export class HomePage extends BasePage {
  protected readonly path = '/';

  // Hero and booking bar (#book-bar)
  readonly exploreRoomsLink: Locator;
  readonly bookingBar: Locator;
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly adults: SelectMenu;
  readonly children: SelectMenu;
  readonly checkAvailabilityButton: Locator;
  readonly bookingPausedNotice: Locator;

  // Sections further down
  readonly roomCards: Locator;
  readonly faqItems: Locator;

  constructor(page: Page) {
    super(page);
    this.exploreRoomsLink = page.getByRole('link', { name: 'Explore Rooms' });
    this.bookingBar = page.locator('#book-bar');
    this.checkInInput = this.bookingBar.getByLabel('Check In');
    this.checkOutInput = this.bookingBar.getByLabel('Check Out');
    this.adults = new SelectMenu(page, 'adults');
    this.children = new SelectMenu(page, 'children');
    this.checkAvailabilityButton = this.bookingBar.getByRole('button', { name: 'Check Availability' });
    this.bookingPausedNotice = this.bookingBar.locator('[data-booking-paused]');
    this.roomCards = page.locator('[data-home="rooms"] [data-room-card]');
    this.faqItems = page.locator('[data-home="faq"] details[data-faq]');
  }

  async searchAvailability({ checkIn, checkOut, adults, children }: AvailabilitySearch) {
    await this.checkInInput.fill(checkIn);
    await this.checkOutInput.fill(checkOut);
    if (adults) await this.adults.choose(adults);
    if (children) await this.children.choose(children);
    await this.checkAvailabilityButton.click();
  }

  roomCard(roomName: string): Locator {
    return this.roomCards.filter({ hasText: roomName });
  }

  faqQuestion(index: number): Locator {
    return this.faqItems.nth(index).locator('summary');
  }
}
