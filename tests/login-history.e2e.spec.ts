import { expect, test } from '@playwright/test';

function randomEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

test.describe('Login shows previous joined sessions', () => {
  test.use({ ignoreHTTPSErrors: true });

  test('login then history list shows previously joined session', async ({
    page,
  }) => {
    const email = randomEmail();
    const password = 'password123';
    const username = 'HistoryUser';

    // Register user via API for stability
    await page.goto('/');
    await page.evaluate(
      async ({ email, password, username }) => {
        try {
          await fetch('/api/auth/email/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, username, password }),
          });
        } catch {}
      },
      { email, password, username },
    );

    // Login via API to avoid UI flakiness
    await page.goto('/');
    await page.evaluate(
      async ({ email, password }) => {
        try {
          await fetch('/api/auth/email/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
        } catch {}
      },
      { email, password },
    );
    await page.reload();
    await page.getByPlaceholder('123-456-789').waitFor({ timeout: 15000 });

    // Create a fake session as this user via same-origin call
    const code = await page.evaluate(async () => {
      const res = await fetch('/api/music-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Party A' }),
      });
      const json = await res.json();
      return String(json.code);
    });

    // Join the session via the UI (client-side navigation), not hard navigation
    // We are on '/', wait for the join form
    await page.getByPlaceholder('123-456-789').waitFor({ timeout: 15000 });
    const formatted = code.replace(/(\d{3})(\d{3})(\d{3})/, '$1-$2-$3');
    // Use stable placeholder from template instead of formControlName
    await page.getByPlaceholder('123-456-789').fill(formatted);
    await page.getByRole('button', { name: 'Rejoindre une session' }).click();
    await page.waitForURL(new RegExp(`/${code}(?:/|$)`));

    // Go home; history should be stored on backend when user loaded the session with auth
    await page.locator('a[href="/"]').first().click();
    await page.waitForURL(/\/$/);

    // Verify the history shows at least one entry with the created session
    await page.waitForSelector('.history-card', { timeout: 15000 });
    const firstCard = page.locator('.history-card').first();
    await expect(firstCard).toContainText('Party A');
  });
});
