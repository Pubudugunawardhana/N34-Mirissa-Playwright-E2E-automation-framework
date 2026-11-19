import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/** /login — guest sign-in (src/components/auth/LoginForm.tsx). Staff accounts are turned away here. */
export class LoginPage extends BasePage {
  protected readonly path = '/login';

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly showPasswordButton: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.showPasswordButton = page.getByRole('button', { name: /Show password|Hide password/ });
    this.signInButton = page.getByRole('button', { name: 'Sign in', exact: true });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password?' });
    this.errorMessage = page.locator('main').getByRole('alert');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
