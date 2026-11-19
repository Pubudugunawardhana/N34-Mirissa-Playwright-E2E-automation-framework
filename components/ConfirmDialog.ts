import type { Locator, Page } from '@playwright/test';

/**
 * The native <dialog> opened by ConfirmSubmitButton (src/components/ConfirmSubmitButton.tsx).
 * It is found by its title, e.g. "Cancel this booking?".
 */
export class ConfirmDialog {
  readonly root: Locator;

  constructor(page: Page, title: string | RegExp) {
    this.root = page.getByRole('dialog', { name: title });
  }

  async confirm(confirmLabel: string) {
    await this.root.getByRole('button', { name: confirmLabel, exact: true }).click();
  }

  async dismiss(cancelLabel: string) {
    await this.root.getByRole('button', { name: cancelLabel, exact: true }).click();
  }
}
