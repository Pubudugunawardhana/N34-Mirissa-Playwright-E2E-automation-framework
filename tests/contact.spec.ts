import { test, expect } from '../fixtures/pageFixtures';
import type { ContactMessage } from '../pages/ContactPage';
import { labelTest, Severity } from '../utils/allure';
import { SIGNED_OUT } from '../utils/constants';
import { uniqueEmail } from '../utils/testUser';
import testData from '../data/testData.json';

test.use({ storageState: SIGNED_OUT });

function validMessage(): ContactMessage {
  return { ...testData.contactMessage, email: uniqueEmail('contact') };
}

test.describe('Contact', () => {
  test.beforeEach(async ({ contactPage }) => {
    await contactPage.goto();
  });

  test('TC35 - Visitor sends a message to the hotel', { tag: '@smoke' }, async ({ contactPage }) => {
    await labelTest({ feature: 'Contact', story: 'Contact form', severity: Severity.CRITICAL });

    await test.step('Fill in and send the form', async () => {
      await contactPage.sendMessage(validMessage());
    });

    await test.step('Verify the thank-you message', async () => {
      await expect(contactPage.sentHeading).toBeVisible();
      await expect(contactPage.sentMessage).toContainText('Your message has been sent.');
      await expect(contactPage.sendAnotherButton).toBeVisible();
    });
  });

  // Data-driven: each scenario breaks one field of an otherwise valid message.
  for (const scenario of testData.contactErrorScenarios) {
    test(`TC36 - Contact form is rejected with ${scenario.title}`, async ({ contactPage }) => {
      await labelTest({ feature: 'Contact', story: 'Contact form validation', severity: Severity.NORMAL });

      await contactPage.sendMessage({ ...validMessage(), ...scenario.overrides });

      await expect(contactPage.fieldError(scenario.field as 'message' | 'consent' | 'email')).toHaveText(
        scenario.error,
      );
      await expect(contactPage.formError).toHaveText('Please fix the highlighted fields.');
      await expect(contactPage.sentHeading).toBeHidden();
    });
  }

  test('TC37 - Contact page shows the map and a directions link', { tag: '@mobile' }, async ({ contactPage }) => {
    await labelTest({ feature: 'Contact', story: 'Location', severity: Severity.MINOR });

    await expect(contactPage.map).toBeVisible();
    await expect(contactPage.directionsLink).toHaveAttribute('href', /google\.[a-z.]+\/maps/);
  });
});
