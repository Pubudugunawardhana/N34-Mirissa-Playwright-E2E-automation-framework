import { expect, type Locator } from '@playwright/test';

/**
 * Waits until React has hydrated the element: React attaches a "__reactFiber…" key to every DOM node it manages.
 *
 * Why: many of the app's form fields are controlled (value comes from useState). Text typed into them before
 * hydration is thrown away when React takes over, so the form is sent with empty fields. Slower browsers
 * (WebKit on CI) hit this often. Call it before filling such a form.
 */
export async function waitForHydration(element: Locator, timeout = 15_000) {
  await expect
    .poll(
      () =>
        element.evaluate((node) => Object.keys(node).some((key) => key.startsWith('__reactFiber'))).catch(() => false),
      { message: 'React should have hydrated the form', timeout },
    )
    .toBe(true);
}
