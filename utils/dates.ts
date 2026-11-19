const DAY_MS = 24 * 60 * 60 * 1000;

/** Today on the hotel's calendar (Sri Lanka), as YYYY-MM-DD — the same "today" the app uses. */
export function hotelToday(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Colombo' }).format(new Date());
}

/** A YYYY-MM-DD date the given number of days from the hotel's today (negative for the past). */
export function daysFromToday(days: number): string {
  const today = new Date(`${hotelToday()}T00:00:00.000Z`);
  return new Date(today.getTime() + days * DAY_MS).toISOString().slice(0, 10);
}

export type Stay = { checkIn: string; checkOut: string; nights: number };

/**
 * A stay far enough ahead that it never overlaps the seeded demo bookings (days 3–20),
 * with a random start so tests running in parallel rarely book the same nights and sell a room out.
 */
export function randomFutureStay(nights = 2): Stay {
  const start = 60 + Math.floor(Math.random() * 600);
  return { checkIn: daysFromToday(start), checkOut: daysFromToday(start + nights), nights };
}
