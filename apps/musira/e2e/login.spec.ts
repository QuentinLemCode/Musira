import { test, expect } from '@playwright/test';

test('has title', async ({ page, context }) => {
  await context.clearCookies();
  await page.goto('/');

  // Expect h1 to contain a substring.
  expect(await page.locator('h1').innerText()).toContain(
    'Prends part à la fête',
  );
  await page.click('text=Se connecter avec un email');
  await page.fill('input[name="email"]', 'admin@musira.fr');
  await page.fill('input[name="password"]', 'password');
  const wait = page.waitForRequest(/\/api\/auth\/email\/login/);
  await page.click('button[type="submit"]');
  await wait;
  await expect(page.locator('h1').first()).toHaveText(
    'Créer une session musicale',
  );
});
