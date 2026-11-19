import { defineConfig } from 'allure';

export default defineConfig({
  name: 'N34 Mirissa E2E Test Report',
  output: './allure-report',
  historyPath: './allure-history/history.jsonl',
  historyLimit: 20,
});
