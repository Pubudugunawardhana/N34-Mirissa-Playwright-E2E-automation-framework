import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(
  { ignores: ['node_modules', 'playwright-report', 'test-results', 'allure-results', 'allure-report'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.mjs'],
    languageOptions: { globals: { process: 'readonly', console: 'readonly' } },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      // Assertions often live in shared flows (fixtures/flows.ts), which the plugin cannot see.
      'playwright/expect-expect': 'off',
      // Data-driven tests are generated in loops on purpose.
      'playwright/valid-title': 'off',
      // Skipping on purpose by device (e.g. desktop-only nav links) is fine; unconditional skips are not.
      'playwright/no-skipped-test': ['warn', { allowConditional: true }],
    },
  },
);
