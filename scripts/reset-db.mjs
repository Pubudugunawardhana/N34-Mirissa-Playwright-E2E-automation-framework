// Wipes the TEST database and fills it with the app's sample data (prisma/seed.mjs).
// Runs before the app is built and started (see webServer in playwright.config.ts), or on its own: npm run db:reset
// Plain JavaScript on purpose, so it runs with `node` before anything is compiled.

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(ROOT, '.env'), quiet: true });

if ((process.env.RESET_DB ?? 'true') !== 'true' && !process.argv.includes('--force')) {
  console.log('[reset-db] RESET_DB is not "true": keeping the existing test data.');
  process.exit(0);
}

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
if (!testDatabaseUrl) {
  console.error('[reset-db] TEST_DATABASE_URL is missing. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const appDir = path.resolve(ROOT, process.env.APP_DIR || '../N34 Mirissa');
if (!fs.existsSync(path.join(appDir, 'prisma', 'schema.prisma'))) {
  console.error(`[reset-db] No prisma/schema.prisma in APP_DIR (${appDir}).`);
  process.exit(1);
}

// Never wipe the app's real database.
const appEnvFile = path.join(appDir, '.env');
if (fs.existsSync(appEnvFile)) {
  const appDatabaseUrl = dotenv.parse(fs.readFileSync(appEnvFile)).DATABASE_URL;
  if (appDatabaseUrl && appDatabaseUrl.trim() === testDatabaseUrl.trim()) {
    console.error("[reset-db] TEST_DATABASE_URL is the app's real DATABASE_URL. Refusing to wipe it.");
    process.exit(1);
  }
}

// Prisma and the seed read DATABASE_URL; a variable already set wins over the app's own .env file.
const childEnv = { ...process.env, DATABASE_URL: testDatabaseUrl };

function run(command) {
  console.log(`[reset-db] ${command}`);
  const result = spawnSync(command, { cwd: appDir, env: childEnv, stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`[reset-db] Failed: ${command}`);
    process.exit(result.status ?? 1);
  }
}

run('npx prisma db push --force-reset --skip-generate');
run('npm run seed');
console.log('[reset-db] Test database is fresh and seeded.');
