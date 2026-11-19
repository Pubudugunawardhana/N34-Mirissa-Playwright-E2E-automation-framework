import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const ROOT = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable "${name}". Copy .env.example to .env and fill it in.`);
  }
  return value;
}

const appDir = path.resolve(ROOT, process.env.APP_DIR || '../N34 Mirissa');
const testDatabaseUrl = requireEnv('TEST_DATABASE_URL');

// Safety net: scripts/reset-db.mjs wipes the test database before each run, so it must never be the app's real one.
const appEnvFile = path.join(appDir, '.env');
if (fs.existsSync(appEnvFile)) {
  const appDatabaseUrl = dotenv.parse(fs.readFileSync(appEnvFile)).DATABASE_URL;
  if (appDatabaseUrl && appDatabaseUrl.trim() === testDatabaseUrl.trim()) {
    throw new Error(
      "TEST_DATABASE_URL is the same as the app's DATABASE_URL. Point it at a separate Neon branch so tests never touch real data.",
    );
  }
}

export const env = {
  appDir,
  baseURL: process.env.BASE_URL || 'http://localhost:3100',
  testDatabaseUrl,
  authSecret: requireEnv('AUTH_SECRET'),
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin',
  resetDb: (process.env.RESET_DB ?? 'true') === 'true',
};
