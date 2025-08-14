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

const LocalStorageKeys = {
  TOKEN: 'token',
  SESSIONS_CREATOR: 'sessions_creator',
  STATE: 'state',
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
    console.log(
      'checkAuthStatus() called, current loggedUser state:',
      this.loggedUser(),
    );
    this.http
      .get<JwtUser>(this.authEndpoint + '/me', {
        withCredentials: true,
      })
      .subscribe({
        next: (user) => {
          console.log(
            'checkAuthStatus success, setting user to logged in:',
            user,
          );
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
          console.log('checkAuthStatus failed. Error:', err.message);
          // Ne réinitialiser à false que si c'est une vraie erreur d'authentification
          // Pas en cas d'erreur SSL ou réseau
          if (err.status === 401 || err.status === 403) {
            console.log('Auth error (401/403), setting user to logged out');
            this.loggedUser.set({ isLoggedIn: false });
          } else {
            console.log('Network/SSL error, keeping current auth state');
            // Garder l'état actuel en cas d'erreur réseau/SSL
          }
        },
      });
  }

  /**
   * Runs once during application bootstrap to prefetch authentication state
   * from the `/auth/me` endpoint if a cookie exists. Always resolves.
   */
  public async initializeAuth(): Promise<void> {
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
        switchMap(() =>
          this.http.get<JwtUser>(this.authEndpoint + '/me', {
            withCredentials: true,
          }),
        ),
        tap((user) => {
          const mapped: UserState = {
            isLoggedIn: true,
            id: user.id,
            admin: user.admin,
            userId: String(user.id),
            username: user.name,
          };
          this.loggedUser.set(mapped);
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
      .pipe(tap(() => this.refreshAuthStatus()));
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
    await this.http.post(this.authEndpoint + '/logout', {}).toPromise();
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
    return 'state';
  }

  private checkState(state: string) {
    if (state !== 'state') {
      throw new Error('Invalid state');
    }
    return;
  }

  private redirectUrl(provider: OAuthProviderType) {
    return `https://${window.location.host}/oauth/callback/${provider}`;
  }
}
