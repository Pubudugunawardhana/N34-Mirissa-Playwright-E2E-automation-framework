import type { Locator, Page } from '@playwright/test';

export type NavLinkName = 'Home' | 'Rooms' | 'Experiences' | 'Dining' | 'Contact';

/** The fixed top navigation (src/components/SiteNavBar.tsx). */
export class NavBar {
  readonly root: Locator;
  readonly logo: Locator;
  readonly bookNow: Locator;
  readonly signUp: Locator;
  readonly signOut: Locator;
  readonly themeToggle: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('header nav').first();
    this.logo = this.root.getByRole('link', { name: /N34\s*Mirissa/ });
    this.bookNow = this.root.getByRole('link', { name: 'Book Now', exact: true });
    this.signUp = this.root.getByRole('link', { name: 'Sign Up', exact: true }).first();
    this.signOut = this.root.getByRole('button', { name: 'Sign Out', exact: true }).first();
    this.themeToggle = this.root.getByRole('button', { name: /Switch to (dark|light) mode/ });
    this.menuButton = this.root.getByRole('button', { name: /(Open|Close) menu/ });
  }

  /** A main link. On a phone the links sit in the menu, so open it first with openMobileMenu(). */
  link(name: NavLinkName): Locator {
    return this.root.getByRole('link', { name, exact: true }).first();
  }

  /** "My Account" for guests, "Admin Panel" for staff. */
  accountLink(label: 'My Account' | 'Admin Panel' = 'My Account'): Locator {
    return this.root.getByRole('link', { name: label }).first();
  }

  async openMobileMenu() {
    await this.root.getByRole('button', { name: 'Open menu' }).click();
  }
}
