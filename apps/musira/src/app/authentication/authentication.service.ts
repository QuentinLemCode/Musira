import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, signal } from '@angular/core';
import {
  OAuthProvider,
  type JwtPayload,
  type JwtToken,
  type OAuthProviderType,
} from '@musira/api-interfaces';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from '../services/storage.service';

const LocalStorageKeys = {
  TOKEN: 'token',
  SESSIONS_CREATOR: 'sessions_creator',
  STATE: 'state',
} as const;

interface BaseUserState {
  username: string;
  userId: string;
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
  public loggedUser = signal<UserState>(this.getSession());
  private readonly authEndpoint = environment.serverUrl + 'auth';

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  oAuthLogin(provider: OAuthProviderType, code: string, state: string) {
    this.checkState(state);
    return this.http
      .post<JwtToken>(this.authEndpoint + '/oauth/login', {
        code,
        state,
        provider,
      })
      .pipe(
        tap((data) => {
          this.saveToken(data.accessToken);
        }),
      );
  }

  emailLogin(email: string, password: string) {
    return this.http
      .post<JwtToken>(this.authEndpoint + '/email/login', {
        email,
        password,
      })
      .pipe(
        tap((data) => {
          this.saveToken(data.accessToken);
        }),
      );
  }

  emailRegister(email: string, username: string, password: string) {
    return this.http
      .post<JwtToken>(this.authEndpoint + '/email/register', {
        email,
        username,
        password,
      })
      .pipe(
        tap((data) => {
          this.saveToken(data.accessToken);
        }),
      );
  }

  isSessionCreator(sessionId: number) {
    const sessions = localStorage
      .getItem(LocalStorageKeys.SESSIONS_CREATOR)
      ?.split(';');
    return sessions?.includes(sessionId.toString()) ?? false;
  }

  addSessionCreator(sessionId: number) {
    const sessions = localStorage
      .getItem(LocalStorageKeys.SESSIONS_CREATOR)
      ?.split(';');
    if (!sessions?.includes(sessionId.toString())) {
      sessions?.push(sessionId.toString());
      localStorage.setItem(
        LocalStorageKeys.SESSIONS_CREATOR,
        sessions?.join(';') ?? '',
      );
    }
  }

  deleteSessionCreator(sessionId: number) {
    const sessions = localStorage
      .getItem(LocalStorageKeys.SESSIONS_CREATOR)
      ?.split(';');
    if (sessions?.includes(sessionId.toString())) {
      localStorage.setItem(
        LocalStorageKeys.SESSIONS_CREATOR,
        sessions
          ?.filter((session) => session !== sessionId.toString())
          .join(';') ?? '',
      );
    }
  }

  private getSession(): UserState {
    const user = this.tokenPayload;
    if (!user) {
      return {
        isLoggedIn: false,
      };
    }
    return {
      isLoggedIn: true,
      username: user.context.user.name,
      userId: user.context.user.email,
      admin: user.context.user.admin,
    };
  }

  private saveToken(token: string) {
    this.storage.setLocalItem(LocalStorageKeys.TOKEN, token);
    this.loggedUser.set(this.getSession());
  }

  private get tokenPayload(): JwtPayload | null {
    const token = this.storage.getLocalItem<string>(LocalStorageKeys.TOKEN);
    const parsedToken = atob(token?.split('.')?.[1] ?? '');
    try {
      return JSON.parse(parsedToken) as JwtPayload;
    } catch (e) {
      this.storage.removeLocalItem(LocalStorageKeys.TOKEN);
    }
    return null;
  }

  async logout() {
    this.storage.clearLocal();
    this.storage.clearSession();
    this.loggedUser.set({
      isLoggedIn: false,
    });
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
    }
  }

  private generateState() {
    const uuid = crypto.randomUUID();
    this.storage.setLocalItem(LocalStorageKeys.STATE, uuid);
    return uuid;
  }

  private checkState(state: string) {
    this.storage.getLocalItem(LocalStorageKeys.STATE);
    if (state !== this.storage.getLocalItem(LocalStorageKeys.STATE)) {
      throw new Error('Invalid state');
    }
    this.storage.removeLocalItem(LocalStorageKeys.STATE);
    return;
  }

  private redirectUrl(provider: OAuthProviderType) {
    return `https://${window.location.host}/oauth/callback/${provider}`;
  }
}
