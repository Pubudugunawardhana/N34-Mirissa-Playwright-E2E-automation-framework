import type { Locator, Page } from '@playwright/test';
import { waitForHydration } from '../../utils/hydration';

/** /admin/settings — contacts, map and the site status switches (src/components/admin/SettingsForm.tsx). */
export class AdminSettingsPage {
  readonly pauseBookingSwitch: Locator;
  readonly maintenanceSwitch: Locator;
  readonly saveButton: Locator;
  readonly savedMessage: Locator;

  constructor(readonly page: Page) {
    this.pauseBookingSwitch = page.getByRole('switch', { name: /Pause online booking/ });
    this.maintenanceSwitch = page.getByRole('switch', { name: /Maintenance mode/ });
    this.saveButton = page.getByRole('button', { name: /^(Save changes|Saving…)$/ });
    this.savedMessage = page.getByRole('status').filter({ hasText: 'Saved.' });
  }

  async goto() {
    await this.page.goto('/admin/settings');
  }

  /** The switch input is visually hidden, so its label row is clicked when the state needs to change. */
  private async setSwitch(toggle: Locator, on: boolean) {
    if ((await toggle.isChecked()) !== on) {
      await this.page.locator('label').filter({ has: toggle }).click();
    }
  }

  /** Sets both switches and saves. */
  async setSiteStatus({ bookingsPaused, maintenance }: { bookingsPaused: boolean; maintenance: boolean }) {
    await waitForHydration(this.pauseBookingSwitch); // controlled switches
    await this.setSwitch(this.pauseBookingSwitch, bookingsPaused);
    await this.setSwitch(this.maintenanceSwitch, maintenance);
    await this.saveButton.click();
  }
}
