import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { OAuthProvider, type OAuthProviderType } from '@musira/api';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

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

  constructor() {
    this.checkAuthStatus();
  }

  private checkAuthStatus() {
    this.http
      .get<BaseUserState>(this.authEndpoint + '/me', {
        withCredentials: true,
      })
      .subscribe({
        next: (user) => {
          this.loggedUser.set({ ...user, isLoggedIn: true });
        },
        error: (err) => {
          this.loggedUser.set({ isLoggedIn: false });
        },
      });
  }

  deleteAccount() {
    return this.http.delete(this.authEndpoint + '/account');
  }

  oAuthLogin(provider: OAuthProviderType, code: string, state: string) {
    this.checkState(state);
    return this.http.post(this.authEndpoint + '/oauth/login', {
      code,
      state,
      provider,
    });
  }

  emailLogin(email: string, password: string) {
    return this.http
      .post(this.authEndpoint + '/email/login', {
        email,
        password,
      })
      .pipe(tap(() => this.checkAuthStatus()));
  }

  emailRegister(email: string, username: string, password: string) {
    return this.http
      .post(this.authEndpoint + '/email/register', {
        email,
        username,
        password,
      })
      .pipe(tap(() => this.checkAuthStatus()));
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
