import { expect, type Locator, type Page } from '@playwright/test';

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

/**
 * Waits until React has hydrated every link, button and form field on the page.
 *
 * Why: after a full page load (goto, reload) the HTML shows up before React takes over. A click in that gap
 * does nothing (no handler yet), so the test waits for a dialog or a redirect that never comes. This happens
 * most on a busy machine, e.g. several local workers sharing the CPU with the app server.
 * The page fixture (fixtures/pageFixtures.ts) calls this after every goto() and reload().
 */
export async function waitForPageHydration(page: Page, timeout = 20_000) {
  await expect
    .poll(
      () =>
        page
          .evaluate(() => {
            const isHydrated = (node: Element) => Object.keys(node).some((key) => key.startsWith('__reactFiber'));
            // Hidden inputs are left out: Next.js adds its own for Server Action forms, and React never claims them.
            const controls = document.querySelectorAll(
              'body a[href], body button, body input:not([type="hidden"]), body textarea, body select',
            );
            return isHydrated(document.body) && Array.from(controls).every(isHydrated);
          })
          .catch(() => false),
      { message: 'React should have hydrated the page', timeout },
    )
    .toBe(true);
}
