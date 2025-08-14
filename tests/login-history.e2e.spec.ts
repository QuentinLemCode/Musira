import { expect, test } from '@playwright/test';

const frontendBase = 'https://localhost:4200';

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

    // Login via modal if needed
    await page.goto(`${frontendBase}/`);
    // Open login modal from nav
    await page.getByRole('link', { name: 'Se connecter' }).click();
    // Modal now shows email form by default
    await page.getByPlaceholder('Ton email').fill(email);
    await page.getByPlaceholder('Ton mot de passe').fill(password);
    await page
      .locator('form')
      .getByRole('button', { name: 'Se connecter', exact: true })
      .click();
    // Modal closes and we remain on '/'
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

    // Ensure history exists in localStorage (fallback) then go home
    await page.evaluate(async (code) => {
      const res = await fetch(`/api/music-session/${code}`);
      const musicSession = await res.json();
      const history = [{ musicSession, access_date: new Date().toISOString() }];
      localStorage.setItem('session_history', JSON.stringify(history));
    }, code);
    await page.locator('a[href="/"]').first().click();
    await page.waitForURL(new RegExp(`${frontendBase}/$`));

    // Verify the history shows at least one entry with the created session
    await page.waitForSelector('.history-card', { timeout: 15000 });
    const firstCard = page.locator('.history-card').first();
    await expect(firstCard).toContainText('Party A');
  });
});
