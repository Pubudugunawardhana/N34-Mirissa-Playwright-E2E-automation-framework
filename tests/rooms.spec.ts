import { test, expect } from '../fixtures/pageFixtures';
import type { SortLabel } from '../pages/RoomsPage';
import { labelTest, Severity } from '../utils/allure';
import { SIGNED_OUT } from '../utils/constants';
import { daysFromToday, randomFutureStay } from '../utils/dates';
import testData from '../data/testData.json';

test.use({ storageState: SIGNED_OUT });

const ROOMS = testData.rooms;
const roomByName = Object.fromEntries(Object.values(ROOMS).map((room) => [room.name, room]));

test.describe('Rooms', () => {
  test.beforeEach(async ({ roomsPage }) => {
    await roomsPage.goto();
  });

  test('TC09 - All rooms are listed, cheapest first by default', async ({ roomsPage }) => {
    await labelTest({ feature: 'Rooms', story: 'Room list', severity: Severity.CRITICAL });

    await expect(roomsPage.resultSummary).toHaveText('3 rooms to choose from');
    await expect(roomsPage.roomNames).toHaveText([ROOMS.deluxe.name, ROOMS.family.name, ROOMS.villa.name]);
    expect(await roomsPage.getRoomPrices()).toEqual([ROOMS.deluxe.price, ROOMS.family.price, ROOMS.villa.price]);
  });

  // Data-driven: one test per sort option in testData.json.
  for (const scenario of testData.sortScenarios) {
    test(`TC10 - Sort by "${scenario.label}"`, async ({ roomsPage }) => {
      await labelTest({ feature: 'Rooms', story: 'Sorting', severity: Severity.NORMAL });

      await test.step(`Choose "${scenario.label}" and search`, async () => {
        await roomsPage.filter({ sort: scenario.label as SortLabel });
      });

      await test.step(`Verify rooms are ordered by ${scenario.by} (${scenario.order})`, async () => {
        await expect(roomsPage.roomNames.first()).toHaveText(scenario.expectedFirst);
        const names = await roomsPage.getRoomNames();
        const values = names.map((name) => roomByName[name][scenario.by as 'price' | 'area']);
        const sorted = [...values].sort((a, b) => (scenario.order === 'asc' ? a - b : b - a));
        expect(values).toEqual(sorted);
      });
    });
  }

  for (const scenario of testData.capacityScenarios) {
    test(`TC11 - Guest filter for ${scenario.title} shows only rooms that fit`, async ({ roomsPage }) => {
      await labelTest({ feature: 'Rooms', story: 'Guest filter', severity: Severity.CRITICAL });

      await roomsPage.filter({ adults: scenario.adults, children: scenario.children ?? undefined });
      await expect(roomsPage.resultSummary).toContainText('match your search');
      await expect(roomsPage.roomNames).toHaveText(scenario.expectedRooms);
    });
  }

  test('TC12 - Facility filter shows only rooms with that facility', async ({ page, roomsPage }) => {
    await labelTest({ feature: 'Rooms', story: 'Facility filter', severity: Severity.NORMAL });

    await roomsPage.filter({ facilities: ['Spa'] });
    await expect(page).toHaveURL(/facility=/);
    await expect(roomsPage.roomNames).toHaveText([ROOMS.villa.name]);
    await expect(roomsPage.clearFiltersLink).toBeVisible();
  });

  test('TC13 - A search no room can fit shows the empty state', async ({ roomsPage }) => {
    await labelTest({ feature: 'Rooms', story: 'Guest filter', severity: Severity.MINOR });

    await roomsPage.filter({ adults: '6 Adults' });
    await expect(roomsPage.noResults).toBeVisible();
    await expect(roomsPage.roomCards).toHaveCount(0);
  });

  test('TC14 - Dates show how many of each room are left', { tag: '@mobile' }, async ({ roomsPage }) => {
    await labelTest({ feature: 'Rooms', story: 'Availability', severity: Severity.CRITICAL });
    const stay = randomFutureStay(2);

    await roomsPage.filter({ checkIn: stay.checkIn, checkOut: stay.checkOut });
    await expect(roomsPage.resultSummary).toHaveText(/\d of 3 rooms available for these dates/);
    await expect(roomsPage.heading.locator('xpath=following-sibling::p')).toContainText('(2 nights)');
    await expect(roomsPage.roomCard(ROOMS.deluxe.name).getByText(/\d+ rooms? left/)).toBeVisible();
  });

  test('TC15 - Check-out before check-in shows an error', async ({ roomsPage }) => {
    await labelTest({ feature: 'Rooms', story: 'Availability', severity: Severity.NORMAL });

    await roomsPage.filter({ checkIn: daysFromToday(30), checkOut: daysFromToday(28) });
    await expect(roomsPage.alert).toHaveText('Check-out must be after check-in.');
  });

  test('TC16 - An unknown room id shows "Page not found"', async ({ page, roomDetailsPage }) => {
    await labelTest({ feature: 'Rooms', story: 'Room details', severity: Severity.MINOR });

    // No status check: /rooms has a loading screen, so the page is streamed and the 404 arrives inside a 200 response.
    await page.goto('/rooms/this-room-does-not-exist');
    await expect(roomDetailsPage.heading).toHaveText(testData.messages.notFound);
  });
});
