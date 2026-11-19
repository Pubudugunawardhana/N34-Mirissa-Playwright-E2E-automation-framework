export type GuestUser = { name: string; email: string; password: string; phone: string };

/** A unique email per call, so parallel tests and repeated runs never collide. */
export function uniqueEmail(prefix = 'guest'): string {
  const stamp = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${prefix}.${stamp}@n34-e2e.test`;
}

/** A fresh guest account that passes the app's validation (password needs a letter and a number). */
export function newGuestUser(prefix = 'guest'): GuestUser {
  return {
    name: 'Test Guest',
    email: uniqueEmail(prefix),
    password: 'Mirissa2026!',
    phone: '071 234 5678',
  };
}
