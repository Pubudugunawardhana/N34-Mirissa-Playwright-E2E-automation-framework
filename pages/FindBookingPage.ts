import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /book/find — a guest without an account looks a booking up by reference and email. */
export class FindBookingPage extends BasePage {
  protected readonly path = '/book/find';

  readonly referenceInput: Locator;
  readonly emailInput: Locator;
  readonly findButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.referenceInput = page.locator('#find-reference');
    this.emailInput = page.locator('#find-email');
    this.findButton = page.getByRole('button', { name: 'Find my booking' });
    this.errorMessage = page.locator('main').getByRole('alert');
  }

  async find(reference: string, email: string) {
    await this.referenceInput.fill(reference);
    await this.emailInput.fill(email);
    await this.findButton.click();
  }
}
