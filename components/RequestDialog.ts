import type { Locator, Page } from '@playwright/test';

export type RequestDetails = {
  name: string;
  email: string;
  phone?: string;
  date: string;
  guests?: number;
  note?: string;
};

/**
 * The "Request" window on Dining special dinners and Experiences
 * (src/components/dining/ExperienceRequestButton.tsx). Its field ids come from useId(),
 * so fields are found by their labels, inside the dialog named after the experience.
 */
export class RequestDialog {
  readonly root: Locator;
  readonly sendButton: Locator;
  readonly closeButton: Locator;
  readonly successMessage: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page, title: string) {
    this.root = page.getByRole('dialog', { name: title });
    this.sendButton = this.root.getByRole('button', { name: 'Send request' });
    this.closeButton = this.root.getByRole('button', { name: 'Close', exact: true });
    this.successMessage = this.root.getByText(/Request sent\./);
    this.errorMessage = this.root.getByRole('alert');
  }

  async fill({ name, email, phone, date, guests, note }: RequestDetails) {
    await this.root.getByLabel('Your name').fill(name);
    await this.root.getByLabel('Email', { exact: true }).fill(email);
    if (phone) await this.root.getByLabel(/^Phone/).fill(phone);
    await this.root.getByLabel('Preferred date').fill(date);
    if (guests !== undefined) await this.root.getByLabel('Guests').fill(String(guests));
    if (note) await this.root.getByLabel(/Anything we should know/).fill(note);
  }

  async send(details: RequestDetails) {
    await this.fill(details);
    await this.sendButton.click();
  }
}
