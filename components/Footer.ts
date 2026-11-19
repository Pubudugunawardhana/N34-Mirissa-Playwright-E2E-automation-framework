import type { Locator, Page } from '@playwright/test';

/** The site footer (src/components/SiteFooter.tsx). */
export class Footer {
  readonly root: Locator;
  readonly exploreLinks: Locator;
  readonly guestLinks: Locator;
  readonly adminLink: Locator;
  readonly backToTop: Locator;

  constructor(page: Page) {
    this.root = page.locator('footer');
    this.exploreLinks = this.root.getByRole('navigation', { name: 'Explore' }).getByRole('link');
    this.guestLinks = this.root.getByRole('navigation', { name: 'Guests' }).getByRole('link');
    this.adminLink = this.root.getByRole('link', { name: 'Admin', exact: true });
    this.backToTop = this.root.getByRole('link', { name: /Back to top/ });
  }

  guestLink(name: string): Locator {
    return this.root.getByRole('navigation', { name: 'Guests' }).getByRole('link', { name, exact: true });
  }
}
