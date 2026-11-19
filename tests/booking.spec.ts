import { test, expect } from '../fixtures/pageFixtures';
import { createGuestBooking } from '../fixtures/flows';
import type { MealPlanLabel } from '../pages/BookingPage';
import { labelTest, Severity } from '../utils/allure';
import { SIGNED_OUT } from '../utils/constants';
import { daysFromToday, randomFutureStay } from '../utils/dates';
import { uniqueEmail } from '../utils/testUser';
import testData from '../data/testData.json';

// Booking does not need an account, so these run as a visitor who is not signed in.
test.use({ storageState: SIGNED_OUT });

const DELUXE = testData.rooms.deluxe;

test.describe('Booking', () => {
  test(
    'TC17 - Guest books a room, finds the booking again and cancels it',
    { tag: '@smoke' },
    async ({ roomsPage, roomDetailsPage, bookingPage, confirmationPage, findBookingPage }) => {
      await labelTest({ feature: 'Booking', story: 'Book without an account', severity: Severity.BLOCKER });
      const guest = { guestName: 'Nimali Silva', email: uniqueEmail('booking'), phone: '077 123 4567' };
      const specialRequests = 'Late check-in, around 9 pm.';

      const booking = await createGuestBooking(
        { roomsPage, roomDetailsPage, bookingPage, confirmationPage },
        { roomName: DELUXE.name, ...guest, mealPlan: 'Breakfast', specialRequests },
      );

      await test.step('Verify the new booking is pending and unpaid', async () => {
        await expect(confirmationPage.bookingStatus).toHaveText('Pending');
        await expect(confirmationPage.paymentStatus).toHaveText('Unpaid');
        await expect(confirmationPage.card).toContainText(specialRequests);
        await expect(confirmationPage.createAccountLink).toBeVisible();
      });

      await test.step('Find the booking again with its reference and email', async () => {
        await findBookingPage.goto();
        await findBookingPage.find(booking.reference, guest.email);
        await expect(confirmationPage.heading).toHaveText('Booking details');
        await expect(confirmationPage.reference).toHaveText(booking.reference);
      });

      await test.step('Cancel the booking', async () => {
        await confirmationPage.cancelBooking();
        await expect(confirmationPage.bookingStatus).toHaveText('Cancelled');
        await expect(confirmationPage.cancelButton).toBeHidden();
      });
    },
  );

  // Data-driven: invalid stays keep "Confirm booking" disabled and say why.
  for (const scenario of testData.stayBlockerScenarios) {
    test(`TC18 - Booking is blocked for ${scenario.title}`, async ({ roomsPage, bookingPage }) => {
      await labelTest({ feature: 'Booking', story: 'Stay validation', severity: Severity.CRITICAL });

      await test.step('Open the booking form', async () => {
        await roomsPage.goto();
        await roomsPage.bookRoom(DELUXE.name);
        await expect(bookingPage.heading).toHaveText('Complete your booking');
      });

      await test.step(`Enter ${scenario.title}`, async () => {
        await bookingPage.fillStay({
          checkIn: daysFromToday(scenario.checkInOffset),
          checkOut: daysFromToday(scenario.checkOutOffset),
        });
      });

      await test.step('Verify the reason is shown and booking is disabled', async () => {
        await expect(bookingPage.blockerMessage).toHaveText(scenario.message);
        await expect(bookingPage.confirmButton).toBeDisabled();
      });
    });
  }

  test('TC19 - Booking form without dates asks for them', async ({ roomsPage, bookingPage }) => {
    await labelTest({ feature: 'Booking', story: 'Stay validation', severity: Severity.NORMAL });

    await roomsPage.goto();
    await roomsPage.bookRoom(DELUXE.name);
    await expect(bookingPage.blockerMessage).toHaveText('Provide check-in & check-out dates.');
    await expect(bookingPage.confirmButton).toBeDisabled();
  });

  // Data-driven: the summary total is room price × nights + meal rate × guests × nights.
  for (const plan of testData.mealPlans) {
    test(`TC20 - Total price is right for the "${plan.label}" meal plan`, async ({ roomsPage, bookingPage }) => {
      await labelTest({ feature: 'Booking', story: 'Price summary', severity: Severity.CRITICAL });
      const stay = randomFutureStay(3);
      const guests = 2;

      await test.step('Open the booking form and choose 2 adults for 3 nights', async () => {
        await roomsPage.goto();
        await roomsPage.bookRoom(DELUXE.name);
        await bookingPage.fillStay({ ...stay, adults: '2 Adults', children: 'No children' });
      });

      await test.step(`Choose "${plan.label}"`, async () => {
        await bookingPage.chooseMealPlan(plan.label as MealPlanLabel);
        await expect(bookingPage.mealPlanRadio(plan.label as MealPlanLabel)).toBeChecked();
        await expect(bookingPage.summaryMeals).toHaveText(plan.label);
        await expect(bookingPage.summaryGuests).toHaveText('2 Adults');
      });

      await test.step('Verify the total', async () => {
        const expected = DELUXE.price * stay.nights + plan.pricePerGuestNight * guests * stay.nights;
        await expect.poll(() => bookingPage.getTotal(), { message: 'summary total' }).toBe(expected);
      });
    });
  }

  for (const scenario of testData.bookingFieldErrorScenarios) {
    test(`TC21 - Booking is rejected with ${scenario.title}`, async ({
      page,
      roomsPage,
      roomDetailsPage,
      bookingPage,
    }) => {
      await labelTest({ feature: 'Booking', story: 'Guest details validation', severity: Severity.NORMAL });

      await test.step('Open the booking form with valid dates', async () => {
        await roomsPage.goto();
        await roomsPage.openRoomDetails(DELUXE.name);
        await roomDetailsPage.startBooking(randomFutureStay(1));
        await expect(bookingPage.roomsLeftMessage).toBeVisible();
      });

      await test.step(`Submit with ${scenario.title}`, async () => {
        await bookingPage.fillGuestDetails(scenario);
        await bookingPage.confirm();
      });

      await test.step('Verify the field error and that no booking was made', async () => {
        await expect(page.locator(`#${scenario.field}-error`)).toHaveText(scenario.error);
        await expect(bookingPage.formError).toHaveText('Please fix the highlighted fields.');
        await expect(page).toHaveURL(/\/book\?/);
      });
    });
  }

  test('TC22 - Opening /book without a room goes back to the rooms page', async ({ page, roomsPage }) => {
    await labelTest({ feature: 'Booking', story: 'Booking form', severity: Severity.MINOR });

    await page.goto('/book');
    await expect(page).toHaveURL(/\/rooms/);
    await expect(roomsPage.heading).toHaveText('Our Rooms');
  });

  test('TC23 - Find my booking rejects a wrong email', async ({ findBookingPage }) => {
    await labelTest({ feature: 'Booking', story: 'Find my booking', severity: Severity.NORMAL });

    await findBookingPage.goto();
    // N34-DEMO01 is one of the seeded sample bookings.
    await findBookingPage.find('N34-DEMO01', 'someone.else@n34-e2e.test');
    await expect(findBookingPage.errorMessage).toHaveText(testData.messages.findBookingNotFound);
  });
});
