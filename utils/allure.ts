import * as allure from 'allure-js-commons';

const EPIC = 'N34 Mirissa Hotel Booking';

export const Severity = {
  BLOCKER: 'blocker',
  CRITICAL: 'critical',
  NORMAL: 'normal',
  MINOR: 'minor',
  TRIVIAL: 'trivial',
} as const;

type Labels = {
  feature?: string;
  story?: string;
  severity?: (typeof Severity)[keyof typeof Severity];
};

/** Groups the test in the Allure report: epic → feature → story, plus a severity. */
export async function labelTest({ feature, story, severity }: Labels) {
  await allure.epic(EPIC);
  if (feature) await allure.feature(feature);
  if (story) await allure.story(story);
  if (severity) await allure.severity(severity);
}
