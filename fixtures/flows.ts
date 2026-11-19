import { expect, test } from '@playwright/test';
import type { Pages } from './pageFixtures';
import type { MealPlanLabel } from '../pages/BookingPage';
import { BOOKING_REFERENCE } from '../utils/constants';
import { randomFutureStay, type Stay } from '../utils/dates';
import { newGuestUser, type GuestUser } from '../utils/testUser';

/** Registers a brand-new guest and signs in as them, for tests that change account data. */
export async function registerAndSignIn(
  { registerPage, loginPage }: Pick<Pages, 'registerPage' | 'loginPage'>,
  prefix = 'guest',
): Promise<GuestUser> {
  const user = newGuestUser(prefix);
  await test.step(`Register and sign in as ${user.email}`, async () => {
    await registerPage.goto();
    await registerPage.register(user);
    await expect(registerPage.heading).toHaveText('Check your inbox');
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await expect(loginPage.page).toHaveURL(/\/$/);
  });
  return user;
}

export type GuestBooking = {
  roomName: string;
  guestName: string;
  email: string;
  phone: string;
  stay?: Stay;
  mealPlan?: MealPlanLabel;
  specialRequests?: string;
};

export type CreatedBooking = { reference: string; bookingId: string; url: string; stay: Stay; total: number };

/**
 * The guest booking journey, shared by several specs:
 * Rooms → room details → booking bar → booking form → confirmation page.
 */
export async function createGuestBooking(
  {
    roomsPage,
    roomDetailsPage,
    bookingPage,
    confirmationPage,
  }: Pick<Pages, 'roomsPage' | 'roomDetailsPage' | 'bookingPage' | 'confirmationPage'>,
  booking: GuestBooking,
): Promise<CreatedBooking> {
  const stay = booking.stay ?? randomFutureStay();

  await test.step(`Open "${booking.roomName}" from the rooms page`, async () => {
    await roomsPage.goto();
    await roomsPage.openRoomDetails(booking.roomName);
    await expect(roomDetailsPage.heading).toHaveText(booking.roomName);
  });

  await test.step(`Pick ${stay.checkIn} → ${stay.checkOut} and continue to booking`, async () => {
    await roomDetailsPage.startBooking(stay);
    await expect(bookingPage.heading).toHaveText('Complete your booking');
    await expect(bookingPage.checkInInput).toHaveValue(stay.checkIn);
  });

  const total = await test.step('Fill in the booking form', async () => {
    await bookingPage.fillGuestDetails(booking);
    if (booking.mealPlan) await bookingPage.chooseMealPlan(booking.mealPlan);
    if (booking.specialRequests) await bookingPage.specialRequestsInput.fill(booking.specialRequests);
    // The button only becomes active once the availability check for the dates has come back.
    await expect(bookingPage.roomsLeftMessage).toBeVisible();
    return bookingPage.getTotal();
  });

  return test.step('Confirm the booking', async () => {
    await bookingPage.confirm();
    await expect(confirmationPage.heading).toHaveText('Booking received');
    const reference = await confirmationPage.getReference();
    expect(reference, 'booking reference format').toMatch(BOOKING_REFERENCE);
    return { reference, bookingId: confirmationPage.bookingId(), url: confirmationPage.page.url(), stay, total };
  });
}
