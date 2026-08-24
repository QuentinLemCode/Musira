import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { firstValueFrom, map, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
type JwtUser = { id: number; admin: boolean; name: string };
type OAuthProviderType = 'google' | 'facebook' | 'spotify' | 'microsoft';
const OAuthProvider = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  SPOTIFY: 'spotify',
  MICROSOFT: 'microsoft',
} as const;
interface BaseUserState {
  username: string;
  userId: string;
  id: number;
  admin: boolean;
}

export type UserState =
  | ({ isLoggedIn: true } & BaseUserState)
  | {
      isLoggedIn: false;
    };

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  public loggedUser = signal<UserState>({ isLoggedIn: false });
  private readonly authEndpoint = environment.serverUrl + 'auth';
  private readonly http = inject(HttpClient);

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {}

  public refreshAuthStatus() {
    // Avoid HTTP calls during SSR/route extraction
    if (!isPlatformBrowser(this.platformId)) return;
    this.http
      .get<JwtUser>(this.authEndpoint + '/me', {
        withCredentials: true,
      })
      .subscribe({
        next: (user) => {
          const mapped: UserState = {
            isLoggedIn: true,
            id: user.id,
            admin: user.admin,
            userId: String(user.id),
            username: user.name,
          };
          this.loggedUser.set(mapped);
        },
        error: (err) => {
          // Only reset to logged out on real auth errors; keep current
          // state on network/SSL errors
          if (err.status === 401 || err.status === 403) {
            this.loggedUser.set({ isLoggedIn: false });
          }
        },
      });
  }

  /**
   * Runs once during application bootstrap to prefetch authentication state
   * from the `/auth/me` endpoint if a cookie exists. Always resolves.
   */
  public async initializeAuth(): Promise<void> {
    // Skip initialization on the server to prevent SSR route extraction timeouts
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    try {
      const user = await firstValueFrom(
        this.http.get<JwtUser>(this.authEndpoint + '/me', {
          withCredentials: true,
        }),
      );
      const mapped: UserState = {
        isLoggedIn: true,
        id: user.id,
        admin: user.admin,
        userId: String(user.id),
        username: user.name,
      };
      this.loggedUser.set(mapped);
    } catch (err: any) {
      if (err?.status === 401 || err?.status === 403) {
        this.loggedUser.set({ isLoggedIn: false });
      }
      // Ignore network/SSL errors and keep current state
    }
  }

  // Intent API
  public setIntent(intent: 'sessions_creator') {
    return this.http.post<{ success: boolean }>(
      this.authEndpoint + '/intent',
      { intent },
      { withCredentials: true },
    );
  }

  public getIntent() {
    return this.http.get<{ intent: string | null }>(
      this.authEndpoint + '/intent',
      { withCredentials: true },
    );
  }

  deleteAccount() {
    return this.http.delete(this.authEndpoint + '/account');
  }

  oAuthLogin(provider: OAuthProviderType, code: string, state: string) {
    this.checkState(state);
    return this.http
      .post(this.authEndpoint + '/oauth/login', {
        code,
        state,
        provider,
      })
      .pipe(
        switchMap(async () => {
          // After OAuth, check for any stored intent
          const me = await firstValueFrom(
            this.http.get<JwtUser>(this.authEndpoint + '/me', {
              withCredentials: true,
            }),
          );
          const intentResp = await firstValueFrom(this.getIntent());
          return { me, intent: intentResp.intent } as {
            me: JwtUser;
            intent: string | null;
          };
        }),
        tap((user) => {
          const mapped: UserState = {
            isLoggedIn: true,
            id: user.me.id,
            admin: user.me.admin,
            userId: String(user.me.id),
            username: user.me.name,
          };
          this.loggedUser.set(mapped);
          // Handle post-login intent redirect
          if (user.intent === 'sessions_creator') {
            // navigation is handled by the caller (callback component)
          }
        }),
        map(() => void 0),
      );
  }

  emailLogin(email: string, password: string) {
    return this.http
      .post(this.authEndpoint + '/email/login', {
        email,
        password,
      })
      .pipe(
        // Fetch the real user so the auth signal holds actual data instead
        // of an optimistic placeholder
        switchMap(() =>
          this.http.get<JwtUser>(this.authEndpoint + '/me', {
            withCredentials: true,
          }),
        ),
        tap((user) => {
          this.loggedUser.set({
            isLoggedIn: true,
            id: user.id,
            admin: user.admin,
            userId: String(user.id),
            username: user.name,
          });
        }),
        map(() => void 0),
      );
  }

  emailRegister(email: string, username: string, password: string) {
    return this.http
      .post(this.authEndpoint + '/email/register', {
        email,
        username,
        password,
      })
      .pipe(tap(() => this.refreshAuthStatus()));
  }

  async logout() {
    await firstValueFrom(this.http.post(this.authEndpoint + '/logout', {}));
    this.loggedUser.set({ isLoggedIn: false });
  }

  loginUrl(provider: OAuthProviderType): string {
    const url = new URL(this.authUrl(provider));

    Object.entries(this.params(provider)).forEach(([key, value]) => {
      if (!value) return;
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  private authUrl(provider: OAuthProviderType) {
    switch (provider) {
      case OAuthProvider.FACEBOOK:
        return 'https://www.facebook.com/v18.0/dialog/oauth';
      case OAuthProvider.SPOTIFY:
        return 'https://accounts.spotify.com/authorize';
      case OAuthProvider.GOOGLE:
        return 'https://accounts.google.com/o/oauth2/v2/auth';
      case OAuthProvider.MICROSOFT:
        return 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize';
      default:
        throw new Error('Invalid provider');
    }
  }

  private params(provider: OAuthProviderType) {
    const uuid = this.generateState();
    switch (provider) {
      case OAuthProvider.FACEBOOK:
        return {
          response_type: 'code',
          client_id: environment.facebookClientId,
          scope: 'email',
          redirect_uri: this.redirectUrl(provider),
          state: uuid,
        };
      case OAuthProvider.SPOTIFY:
        return {
          response_type: 'code',
          client_id: environment.spotifyClientId,
          scope: 'user-read-email user-read-private',
          redirect_uri: this.redirectUrl(provider),
          state: uuid,
        };
      case OAuthProvider.GOOGLE:
        return {
          response_type: 'code',
          client_id: environment.googleClientId,
          scope:
            'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          redirect_uri: this.redirectUrl(provider),
          access_type: 'offline',
          state: uuid,
        };
      case OAuthProvider.MICROSOFT:
        return {
          response_type: 'code',
          client_id: environment.microsoftClientId,
          scope:
            'https://graph.microsoft.com/User.Read openid profile email offline_access',
          redirect_uri: this.redirectUrl(provider),
          state: uuid,
        };
      default:
        throw new Error('Invalid provider');
    }
  }

  private generateState() {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    const state = Array.from(bytes, (b) =>
      b.toString(16).padStart(2, '0'),
    ).join('');
    sessionStorage.setItem('oauth_state', state);
    return state;
  }

  private checkState(state: string) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const expected = sessionStorage.getItem('oauth_state');
    sessionStorage.removeItem('oauth_state');
    if (!state || !expected || state !== expected) {
      throw new Error('Invalid state');
    }
  }

  private redirectUrl(provider: OAuthProviderType) {
    // During SSR, window is not available; return a placeholder that won't be used server-side
    if (!isPlatformBrowser(this.platformId)) {
      return `https://musira.fr/oauth/callback/${provider}`;
    }
    return `https://${window.location.host}/oauth/callback/${provider}`;
  }
}
