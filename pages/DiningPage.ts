import type { Locator, Page } from '@playwright/test';
import { RequestDialog } from '../components/RequestDialog';
import { BasePage } from './BasePage';

/** /dining — menus, room service and special dinners that guests can request. */
export class DiningPage extends BasePage {
  protected readonly path = '/dining';

  readonly mealNav: Locator;
  readonly mealSections: Locator;
  readonly specialDinners: Locator;

  constructor(page: Page) {
    super(page);
    this.mealNav = page.getByRole('navigation', { name: 'Meals' });
    this.mealSections = page.locator('section[data-meal]');
    this.specialDinners = page.locator('#special-dinners');
  }

  /** The card of one special dinner, e.g. "Candlelit beach dinner". */
  specialDinner(title: string): Locator {
    return this.specialDinners.locator(`[data-experience="${title}"]`);
  }

  /** Clicks "Request" on a special dinner and returns its dialog. */
  async openRequest(title: string): Promise<RequestDialog> {
    await this.specialDinner(title).getByRole('button', { name: 'Request', exact: true }).click();
    return new RequestDialog(this.page, title);
  }
}
