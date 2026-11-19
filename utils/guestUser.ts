import fs from 'fs';
import { GUEST_USER_FILE } from './constants';
import type { GuestUser } from './testUser';

/** The guest account that tests/auth.setup.ts registered for this run. */
export function savedGuestUser(): GuestUser {
  if (!fs.existsSync(GUEST_USER_FILE)) {
    throw new Error(
      `${GUEST_USER_FILE} not found. Run the "setup" project first (it runs automatically as a dependency).`,
    );
  }
  return JSON.parse(fs.readFileSync(GUEST_USER_FILE, 'utf8')) as GuestUser;
}
