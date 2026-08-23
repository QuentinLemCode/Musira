import { expect, test } from '@playwright/test';

function randomEmail() {
  return `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;
}

test.describe('Spotify token expiration and re-login flow', () => {
  test.use({ ignoreHTTPSErrors: true });

  test('unconnected spotify session shows disconnected state with re-login option', async ({
    page,
  }) => {
    const email = randomEmail();
    const password = 'password123';
    const username = 'SpotifyTokenTestUser';

    // Setup user
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

    // Create session
    const code = await page.evaluate(async () => {
      const res = await fetch('/api/music-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Token Expiration Test' }),
      });
      const json = await res.json();
      return String(json.code);
    });

    await page.goto(`/${code}`);
    await page.waitForURL(new RegExp(`/${code}(?:/|$)`));

    // Verify the Spotify status component shows disconnected state
    const spotifyStatus = page.locator('musira-spotify-status');
    await spotifyStatus.waitFor({ timeout: 10000 });

    // Should show disconnected state
    await expect(spotifyStatus).toContainText('❌ Non connecté à Spotify');

    // Should show login button
    const loginButton = page.locator('musira-spotify-login');
    await expect(loginButton).toBeVisible();
  });

  test('session status API returns correct state when Spotify is not connected', async ({
    page,
  }) => {
    const email = randomEmail();
    const password = 'password123';
    const username = 'SpotifyExpiryUser';

    // Setup user
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

    // Create session
    const code = await page.evaluate(async () => {
      const res = await fetch('/api/music-session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Token Expiry Test' }),
      });
      const json = await res.json();
      return String(json.code);
    });

    // Check the session status via API
    const status = await page.evaluate(async (code) => {
      const res = await fetch(`/api/session/${code}/music`, {
        credentials: 'include',
      });
      return res.json();
    }, code);

    // When not connected to Spotify, isSpotifyAccountRegistered should be false
    expect(status.isSpotifyAccountRegistered).toBe(false);

    // The backend should return the expiration message
    expect(status.message).toContain('Spotify session has expired');

    // Verify UI displays the disconnected state
    await page.goto(`/${code}`);
    await page.waitForURL(new RegExp(`/${code}(?:/|$)`));

    await page.locator('musira-spotify-status').waitFor({ timeout: 10000 });

    // The component should show disconnected state
    await expect(page.locator('musira-spotify-status')).toContainText(
      '❌ Non connecté à Spotify',
    );
  });
});
