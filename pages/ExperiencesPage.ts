import type { Locator, Page } from '@playwright/test';
import { RequestDialog } from '../components/RequestDialog';
import { BasePage } from './BasePage';

export type ExperienceCategory = 'OCEAN' | 'CULTURE' | 'ADVENTURE' | 'WELLNESS';

/** /experiences — tours and activities, filtered by category chips. */
export class ExperiencesPage extends BasePage {
  protected readonly path = '/experiences';

  readonly categoryNav: Locator;
  readonly activeCategory: Locator;
  readonly experienceCards: Locator;

  constructor(page: Page) {
    super(page);
    this.categoryNav = page.getByRole('navigation', { name: 'Categories' });
    this.activeCategory = this.categoryNav.locator('[aria-current="page"]');
    this.experienceCards = page.locator('[data-experience]');
  }

  async gotoCategory(category: ExperienceCategory) {
    await this.page.goto(`/experiences?category=${category}`);
  }

  /** Clicks a category chip by its visible name (e.g. "Ocean"). */
  async chooseCategory(label: string | RegExp) {
    await this.categoryNav.getByRole('link', { name: label }).click();
  }

  experienceCard(title: string): Locator {
    return this.page.locator(`[data-experience="${title}"]`).first();
  }

  async getExperienceTitles(): Promise<string[]> {
    return this.experienceCards.evaluateAll((cards) => cards.map((card) => card.getAttribute('data-experience') ?? ''));
  }

  async openRequest(title: string): Promise<RequestDialog> {
    await this.experienceCard(title).getByRole('button', { name: 'Request', exact: true }).click();
    return new RequestDialog(this.page, title);
  }
}
