import { test, expect } from '../fixtures/pageFixtures';
import { labelTest, Severity } from '../utils/allure';
import { SIGNED_OUT } from '../utils/constants';
import { randomFutureStay } from '../utils/dates';
import testData from '../data/testData.json';

test.use({ storageState: SIGNED_OUT });

test.describe('Home page', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
  });

  test(
    'TC06 - Availability search takes the guest to matching rooms',
    { tag: '@smoke' },
    async ({ page, homePage, roomsPage }) => {
      await labelTest({ feature: 'Home page', story: 'Availability search', severity: Severity.BLOCKER });
      const stay = randomFutureStay(3);

      await test.step(`Search ${stay.checkIn} → ${stay.checkOut} for 2 adults and 1 child`, async () => {
        await homePage.searchAvailability({ ...stay, adults: '2 Adults', children: '1 Child' });
      });

      await test.step('Verify the rooms page shows the search', async () => {
        await expect(page).toHaveURL(/\/rooms\?/);
        const params = new URL(page.url()).searchParams;
        expect(Object.fromEntries(params)).toMatchObject({
          checkIn: stay.checkIn,
          checkOut: stay.checkOut,
          adults: '2',
          children: '1',
        });
        await expect(roomsPage.checkInInput).toHaveValue(stay.checkIn);
        await expect(roomsPage.checkOutInput).toHaveValue(stay.checkOut);
        await expect(roomsPage.resultSummary).toContainText('available for these dates');
        await expect(roomsPage.roomCards).not.toHaveCount(0);
      });
    },
  );

  test('TC07 - FAQ answers open and close', async ({ homePage }) => {
    await labelTest({ feature: 'Home page', story: 'FAQ', severity: Severity.MINOR });

    await expect(homePage.faqItems.first()).toHaveAttribute('open', '');
    await expect(homePage.faqItems.nth(1)).not.toHaveAttribute('open', '');

    await homePage.faqQuestion(1).click();
    await expect(homePage.faqItems.nth(1)).toHaveAttribute('open', '');
  });

  test('TC08 - A featured room card opens the room page', { tag: '@mobile' }, async ({ homePage, roomDetailsPage }) => {
    await labelTest({ feature: 'Home page', story: 'Featured rooms', severity: Severity.NORMAL });
    const room = testData.rooms.deluxe.name;

    await homePage.roomCard(room).click();
    await expect(roomDetailsPage.heading).toHaveText(room);
    await expect(roomDetailsPage.bookThisRoomButton).toBeVisible();
  });
});
