import type { Locator, Page } from '@playwright/test';
import { SelectMenu } from '../components/SelectMenu';
import { parseLKR } from '../utils/price';
import { BasePage } from './BasePage';

export type SortLabel = 'Price: low to high' | 'Price: high to low' | 'Largest first';

export type RoomFilters = {
  checkIn?: string;
  checkOut?: string;
  adults?: string;
  children?: string;
  sort?: SortLabel;
  facilities?: string[];
};

export class RoomsPage extends BasePage {
  protected readonly path = '/rooms';

  // Filter form (#rooms)
  readonly filterForm: Locator;
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly adults: SelectMenu;
  readonly children: SelectMenu;
  readonly sort: SelectMenu;
  readonly searchButton: Locator;
  readonly moreFilters: Locator;
  readonly clearFiltersLink: Locator;

  // Results
  readonly resultSummary: Locator;
  readonly roomCards: Locator;
  readonly roomNames: Locator;
  readonly roomPrices: Locator;
  readonly noResults: Locator;
  readonly alert: Locator;
  readonly bookingPausedNotice: Locator;

  constructor(page: Page) {
    super(page);
    this.filterForm = page.locator('#rooms form');
    this.checkInInput = page.locator('#filter-check-in');
    this.checkOutInput = page.locator('#filter-check-out');
    this.adults = new SelectMenu(page, 'filter-adults');
    this.children = new SelectMenu(page, 'filter-children');
    this.sort = new SelectMenu(page, 'filter-sort');
    this.searchButton = this.filterForm.getByRole('button', { name: 'Search rooms' });
    this.moreFilters = this.filterForm.locator('summary', { hasText: 'More filters' });
    this.clearFiltersLink = this.filterForm.getByRole('link', { name: 'Clear filters' });

    this.resultSummary = page.locator('main p', {
      hasText: /to choose from|match your search|available for these dates/,
    });
    this.roomCards = page.locator('main article');
    this.roomNames = this.roomCards.locator('h2');
    this.roomPrices = this.roomCards.locator('p', { hasText: '/ night' });
    this.noResults = page.getByText('No rooms match your search');
    this.alert = page.locator('main').getByRole('alert');
    this.bookingPausedNotice = page.locator('main [data-booking-paused]');
  }

  async filter({ checkIn, checkOut, adults, children, sort, facilities }: RoomFilters) {
    if (checkIn) await this.checkInInput.fill(checkIn);
    if (checkOut) await this.checkOutInput.fill(checkOut);
    if (adults) await this.adults.choose(adults);
    if (children) await this.children.choose(children);
    if (sort) await this.sort.choose(sort);
    if (facilities?.length) {
      await this.moreFilters.click();
      for (const facility of facilities) {
        // The checkbox is visually hidden; its label is the visible chip.
        await this.filterForm.locator('label', { hasText: facility }).click();
      }
    }
    await this.searchButton.click();
  }

  /** The card for one room, matched on its exact name. */
  roomCard(roomName: string): Locator {
    return this.roomCards.filter({ has: this.page.getByRole('heading', { name: roomName, exact: true }) });
  }

  async openRoomDetails(roomName: string) {
    await this.roomCard(roomName).getByRole('link', { name: 'More details' }).click();
  }

  async bookRoom(roomName: string) {
    await this.roomCard(roomName).getByRole('link', { name: 'Book Now' }).click();
  }

  async getRoomNames(): Promise<string[]> {
    return (await this.roomNames.allInnerTexts()).map((name) => name.trim());
  }

  async getRoomPrices(): Promise<number[]> {
    return (await this.roomPrices.allInnerTexts()).map(parseLKR);
  }
}
