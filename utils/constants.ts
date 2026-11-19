// Saved sessions, written by tests/auth.setup.ts and git-ignored.
export const ADMIN_AUTH_FILE = 'playwright/.auth/admin.json';
export const GUEST_AUTH_FILE = 'playwright/.auth/guest.json';
// The guest account created during setup, so specs can sign in as it again.
export const GUEST_USER_FILE = 'playwright/.auth/guest-user.json';

// For specs that must start signed out.
export const SIGNED_OUT = { cookies: [], origins: [] };

// Booking references look like N34-ABC123.
export const BOOKING_REFERENCE = /^N34-[A-Z0-9]{6}$/;
