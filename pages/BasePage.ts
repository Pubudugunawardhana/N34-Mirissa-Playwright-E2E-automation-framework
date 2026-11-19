import type { Locator, Page } from '@playwright/test';
import { Footer } from '../components/Footer';
import { NavBar } from '../components/NavBar';

/** What every public page shares: the nav bar, the footer and its main heading. */
export abstract class BasePage {
  readonly nav: NavBar;
  readonly footer: Footer;
  readonly heading: Locator;

  /** The path this page lives at, used by goto(). */
  protected abstract readonly path: string;

  constructor(readonly page: Page) {
    this.nav = new NavBar(page);
    this.footer = new Footer(page);
    this.heading = page.getByRole('heading', { level: 1 });
  }

  /**
   * Opens the page. A relative path, so the baseURL from the config applies.
   * Waits for the HTML, not every image: assertions wait for the elements they need,
   * and image-heavy pages (Dining, Experiences) can take long to fire "load" on a slow CI runner.
   */
  async goto(query = '') {
    await this.page.goto(`${this.path}${query}`, { waitUntil: 'domcontentloaded' });
  }
}
