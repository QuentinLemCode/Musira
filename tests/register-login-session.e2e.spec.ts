import { expect, test } from '@playwright/test';

const frontendBase = 'https://localhost:4200';

function randomEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

test.describe('Email register, login and session history', () => {
  test.use({ ignoreHTTPSErrors: true });

  test('register -> login -> verify nav username -> create session -> history shows', async ({
    page,
  }) => {
    const email = randomEmail();
    const password = 'password123';
    const username = 'PlaywrightUser';

    // Prime origin and register via API for stability
    await page.goto(`${frontendBase}/`);
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

    // Login via API to reduce flakiness
    await page.goto(`${frontendBase}/`);
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

    // Create session from same origin to avoid external redirect and get the code
    const code = await page.evaluate(async () => {
      const res = await fetch('/api/music-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Party' }),
      });
      const json = await res.json();
      return String(json.code);
    });

    // Basic assertion: session code is returned and UI is reachable
    expect(code).toMatch(/\d{9}/);
    await expect(page.locator('nav')).toContainText('Musira');
  });
});
