import type { Locator, Page } from '@playwright/test';
import { waitForHydration } from '../utils/hydration';
import { BasePage } from './BasePage';

export type ContactMessage = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  consent?: boolean;
};

/** /contact — hotel details, map and the contact form (src/components/contact/ContactForm.tsx). */
export class ContactPage extends BasePage {
  protected readonly path = '/contact';

  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly subjectInput: Locator;
  readonly messageInput: Locator;
  readonly consentCheckbox: Locator;
  readonly sendButton: Locator;
  readonly formError: Locator;
  readonly sentHeading: Locator;
  readonly sentMessage: Locator;
  readonly sendAnotherButton: Locator;
  readonly map: Locator;
  readonly directionsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.nameInput = page.locator('#contact-name');
    this.emailInput = page.locator('#contact-email');
    this.phoneInput = page.locator('#contact-phone');
    this.subjectInput = page.locator('#contact-subject');
    this.messageInput = page.locator('#contact-message');
    this.consentCheckbox = page.locator('input[name="consent"]');
    this.sendButton = page.getByRole('button', { name: 'Send message' });
    this.formError = page.locator('main form').getByRole('alert');
    this.sentHeading = page.getByRole('heading', { name: 'Message sent' });
    this.sentMessage = page.locator('main').getByRole('status');
    this.sendAnotherButton = page.getByRole('button', { name: 'Send another message' });
    this.map = page.locator('[data-contact="map"]');
    this.directionsLink = page.locator('a[data-directions]');
  }

  async sendMessage({ name, email, phone, subject, message, consent = true }: ContactMessage) {
    await waitForHydration(this.nameInput); // controlled fields
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    if (phone) await this.phoneInput.fill(phone);
    await this.subjectInput.fill(subject);
    await this.messageInput.fill(message);
    await this.consentCheckbox.setChecked(consent);
    await this.sendButton.click();
  }

  /** The message under a field, e.g. fieldError('message'). */
  fieldError(field: 'name' | 'email' | 'phone' | 'subject' | 'message' | 'consent'): Locator {
    return this.page.locator(`#contact-${field}-error`);
  }
}
