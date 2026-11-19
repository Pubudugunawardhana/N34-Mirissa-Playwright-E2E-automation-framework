import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type RegistrationDetails = { name: string; email: string; password: string; confirmPassword?: string };

/** /register — create a guest account. */
export class RegisterPage extends BasePage {
  protected readonly path = '/register';

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly formError: Locator;
  readonly goToSignInLink: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#name');
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.createAccountButton = page.getByRole('button', { name: 'Create account', exact: true });
    this.formError = page.locator('form').getByRole('alert');
    this.goToSignInLink = page.getByRole('link', { name: 'Go to sign in' });
  }

  async register({ name, email, password, confirmPassword }: RegistrationDetails) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword ?? password);
    await this.createAccountButton.click();
  }

  /** The message under a field, e.g. fieldError('confirmPassword'). */
  fieldError(fieldId: 'name' | 'email' | 'password' | 'confirmPassword'): Locator {
    return this.page.locator(`#${fieldId}-error`);
  }
}
