import type { Locator, Page } from '@playwright/test';
import { SelectMenu } from '../components/SelectMenu';
import { parseLKR } from '../utils/price';
import { BasePage } from './BasePage';

export type MealPlanLabel = 'Room Only' | 'Breakfast' | 'Half Board' | 'Full Board';

export type GuestDetails = { guestName: string; phone: string; email: string };

export type StayDetails = {
  checkIn: string;
  checkOut: string;
  adults?: string;
  children?: string;
};

/** /book?roomId=… — "Complete your booking" (src/components/booking/BookingForm.tsx). */
export class BookingPage extends BasePage {
  protected readonly path = '/book';

  // Step 1: guest details
  readonly guestNameInput: Locator;
  readonly phoneInput: Locator;
  readonly emailInput: Locator;
  readonly signInLink: Locator;

  // Step 2: your stay
  readonly checkInInput: Locator;
  readonly checkOutInput: Locator;
  readonly adults: SelectMenu;
  readonly children: SelectMenu;

  // Step 3: meals and requests
  readonly mealPicker: Locator;
  readonly specialRequestsInput: Locator;

  // Summary
  readonly summary: Locator;
  readonly summaryRoomName: Locator;
  readonly summaryGuests: Locator;
  readonly summaryMeals: Locator;
  readonly total: Locator;
  readonly roomsLeftMessage: Locator;
  readonly blockerMessage: Locator;
  readonly confirmButton: Locator;
  readonly formError: Locator;

  constructor(page: Page) {
    super(page);
    this.guestNameInput = page.locator('#guestName');
    this.phoneInput = page.locator('#phone');
    this.emailInput = page.locator('#email');
    this.signInLink = page.locator('form').getByRole('link', { name: 'Sign in', exact: true });

    this.checkInInput = page.locator('#checkIn');
    this.checkOutInput = page.locator('#checkOut');
    this.adults = new SelectMenu(page, 'adults');
    this.children = new SelectMenu(page, 'children');

    this.mealPicker = page.locator('[data-meal-picker]');
    this.specialRequestsInput = page.locator('#specialRequests');

    this.summary = page.locator('form aside');
    this.summaryRoomName = this.summary.locator('h2');
    this.summaryGuests = this.summaryRow('Guests');
    this.summaryMeals = this.summaryRow('Meals');
    this.total = this.summaryRow('Total');
    this.roomsLeftMessage = this.summary.getByText(/rooms? left for these dates\./);
    this.blockerMessage = this.summary.locator('p[aria-live="polite"]');
    this.confirmButton = this.summary.getByRole('button', { name: /Confirm booking|Saving your booking/ });
    this.formError = page.locator('form').getByRole('alert').first();
  }

  async gotoForRoom(roomId: string, stay?: StayDetails) {
    const query = new URLSearchParams({ roomId });
    if (stay) {
      query.set('checkIn', stay.checkIn);
      query.set('checkOut', stay.checkOut);
    }
    await this.page.goto(`/book?${query}`);
  }

  /** The value cell (<dd>) next to a summary label (<dt>) such as "Guests" or "Total". */
  summaryRow(label: string): Locator {
    return this.summary
      .locator('div')
      .filter({ has: this.page.locator('dt', { hasText: new RegExp(`^${label}$`) }) })
      .locator('dd')
      .first();
  }

  async fillGuestDetails({ guestName, phone, email }: GuestDetails) {
    await this.guestNameInput.fill(guestName);
    await this.phoneInput.fill(phone);
    await this.emailInput.fill(email);
  }

  async fillStay({ checkIn, checkOut, adults, children }: StayDetails) {
    await this.checkInInput.fill(checkIn);
    await this.checkOutInput.fill(checkOut);
    if (adults) await this.adults.choose(adults);
    if (children) await this.children.choose(children);
  }

  /** The meal plan card (a label wrapping a visually hidden radio). */
  private mealPlanCard(plan: MealPlanLabel): Locator {
    return this.page
      .locator('fieldset', { has: this.page.locator('legend', { hasText: 'Meal options' }) })
      .locator('label', { has: this.page.getByText(plan, { exact: true }) });
  }

  async chooseMealPlan(plan: MealPlanLabel) {
    await this.mealPlanCard(plan).click();
  }

  mealPlanRadio(plan: MealPlanLabel): Locator {
    return this.mealPlanCard(plan).locator('input[type="radio"]');
  }

  async getTotal(): Promise<number> {
    return parseLKR(await this.total.innerText());
  }

  async confirm() {
    await this.confirmButton.click();
  }
}
