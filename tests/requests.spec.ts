import { test, expect } from '../fixtures/pageFixtures';
import type { ExperienceCategory } from '../pages/ExperiencesPage';
import { labelTest, Severity } from '../utils/allure';
import { SIGNED_OUT } from '../utils/constants';
import { daysFromToday } from '../utils/dates';
import { uniqueEmail } from '../utils/testUser';
import testData from '../data/testData.json';

test.use({ storageState: SIGNED_OUT });

test.describe('Dining and experiences', () => {
  test('TC38 - Guest requests a special dinner', async ({ diningPage }) => {
    await labelTest({ feature: 'Dining', story: 'Special dinner request', severity: Severity.NORMAL });
    const title = testData.specialDinner;

    await diningPage.goto();

    const dialog = await test.step(`Open the request window for "${title}"`, async () => {
      const opened = await diningPage.openRequest(title);
      await expect(opened.root).toBeVisible();
      return opened;
    });

    await test.step('Send the request', async () => {
      await dialog.send({
        name: 'Test Guest',
        email: uniqueEmail('dinner'),
        date: daysFromToday(14),
        guests: 2,
        note: 'Anniversary',
      });
      await expect(dialog.successMessage).toHaveText(testData.messages.requestSent);
    });

    await test.step('Close the window', async () => {
      await dialog.closeButton.click();
      await expect(dialog.root).toBeHidden();
    });
  });

  test('TC39 - Guest requests an experience', async ({ experiencesPage }) => {
    await labelTest({ feature: 'Experiences', story: 'Experience request', severity: Severity.NORMAL });
    const { title } = testData.experience;

    await experiencesPage.goto();
    const dialog = await experiencesPage.openRequest(title);
    await dialog.send({ name: 'Test Guest', email: uniqueEmail('experience'), date: daysFromToday(10), guests: 3 });
    await expect(dialog.successMessage).toHaveText(testData.messages.requestSent);
  });

  test('TC40 - A request for a date in the past is blocked', async ({ experiencesPage }) => {
    await labelTest({ feature: 'Experiences', story: 'Experience request', severity: Severity.MINOR });
    const { title } = testData.experience;

    await experiencesPage.goto();
    const dialog = await experiencesPage.openRequest(title);
    const dateInput = dialog.root.getByLabel('Preferred date');
    // Playwright's WebKit build for Windows has no date input (it falls back to type="text"), so min is not enforced.
    // WebKit on Linux (CI) and macOS has one, so the check still runs there.
    const hasDateInput = await dateInput.evaluate((input: HTMLInputElement) => input.type === 'date');
    test.skip(!hasDateInput, 'This browser build has no date input, so it cannot enforce the minimum date.');

    // The date box has min=today, so the browser itself refuses to send an earlier date.
    await dialog.fill({ name: 'Test Guest', email: uniqueEmail('experience'), date: daysFromToday(-3) });
    // Checked before sending: if a form were ever sent, React would reset it and the date would be gone.
    expect(await dateInput.evaluate((input: HTMLInputElement) => input.validity.rangeUnderflow)).toBe(true);

    await dialog.sendButton.click();
    await expect(dialog.successMessage).toBeHidden();
    await expect(dialog.root).toBeVisible();
  });

  test('TC41 - Category chips filter the experiences', { tag: '@mobile' }, async ({ page, experiencesPage }) => {
    await labelTest({ feature: 'Experiences', story: 'Categories', severity: Severity.NORMAL });
    const { category, categoryLabel, categoryTitles } = testData.experience;

    await experiencesPage.goto();
    await experiencesPage.chooseCategory(new RegExp(`^${categoryLabel}`));

    await expect(page).toHaveURL(new RegExp(`category=${category as ExperienceCategory}`));
    await expect(experiencesPage.activeCategory).toContainText(categoryLabel);
    await expect
      .poll(async () => [...new Set(await experiencesPage.getExperienceTitles())].sort())
      .toEqual([...categoryTitles].sort());
  });
});
