import type { Locator, Page } from '@playwright/test';

/**
 * The app's custom dropdown (src/components/SelectMenu.tsx): a button with role="combobox"
 * that opens a role="listbox". It is not a native <select>, so selectOption() does not work.
 */
export class SelectMenu {
  readonly trigger: Locator;
  readonly listbox: Locator;

  constructor(page: Page, id: string) {
    this.trigger = page.locator(`[role="combobox"]#${id}`);
    this.listbox = page.locator(`[role="listbox"]#${id}-listbox`);
  }

  /** Opens the menu and picks the option with exactly this label, e.g. "2 Adults". */
  async choose(optionLabel: string) {
    await this.trigger.click();
    await this.listbox.getByRole('option', { name: optionLabel, exact: true }).click();
  }

  /** The label shown on the closed menu. */
  async selectedLabel(): Promise<string> {
    return (await this.trigger.innerText()).trim();
  }
}
