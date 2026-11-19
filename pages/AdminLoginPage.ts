import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /admin-login — staff sign-in (src/components/auth/AdminLoginForm.tsx). */
export class AdminLoginPage extends BasePage {
  protected readonly path = '/admin-login';

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.signInButton = page.getByRole('button', { name: 'Sign in to admin panel' });
    this.errorMessage = page.locator('main').getByRole('alert');
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
