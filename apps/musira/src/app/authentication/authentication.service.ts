import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import {
  OAuthProvider,
  type JwtUser,
  type UserResponseDTO,
  type JwtToken,
  type JwtPayload,
} from '@musira/api-interfaces/index';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from '../services/storage.service';

enum LocalStorageKeys {
  TOKEN = 'token',
  USERNAME = 'username',
  USER_ID = 'user_id',
  SESSIONS_CREATOR = 'sessions_creator',
  EXPIRES_AT = 'expires_at',
  ROLE = 'role',
  TYPE = 'type',
  PROVIDER = 'provider',
  EMAIL = 'email',
  REFRESH_TOKEN = 'refresh_token',
}

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
  private readonly usersEndpoint = environment.serverUrl + 'auth';

  constructor(
    private readonly http: HttpClient,
    private readonly storage: StorageService,
  ) {}

  emailProfile() {
    return this.http.get<JwtUser>(this.usersEndpoint + '/email/profile');
  }

  oAuthLogin(provider: OAuthProvider, code: string, state: string) {
    return this.http
      .post<JwtToken>(this.usersEndpoint + '/oauth/login', {
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
      .post<JwtToken>(this.usersEndpoint + '/email/login', {
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
      .post<JwtToken>(this.usersEndpoint + '/email/register', {
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

  getAllUsers() {
    return this.http.get<UserResponseDTO[]>(this.usersEndpoint);
  }

  delete(id: number) {
    return this.http.delete<UserResponseDTO[]>(this.usersEndpoint + '/' + id);
  }

  unlock(id: number) {
    return this.http.post<UserResponseDTO[]>(
      this.usersEndpoint + '/email/unlock/' + id,
      {},
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
      this.storage.clearLocal();
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

  loginUrl(provider: OAuthProvider): string {
    const url = new URL(this.authUrl(provider));

    Object.entries(this.params(provider)).forEach(([key, value]) => {
      if (!value) return;
      url.searchParams.set(key, value);
    });
    return url.toString();
  }

  private authUrl(provider: OAuthProvider) {
    switch (provider) {
      case OAuthProvider.FACEBOOK:
        return 'https://www.facebook.com/v18.0/dialog/oauth';
      case OAuthProvider.SPOTIFY:
        return 'https://accounts.spotify.com/authorize';
      case OAuthProvider.GOOGLE:
        return 'https://accounts.google.com/o/oauth2/v2/auth';
    }
  }

  private params(provider: OAuthProvider) {
    const uuid = crypto.randomUUID();
    switch (provider) {
      case OAuthProvider.FACEBOOK:
        return {
          response_type: 'code',
          client_id: environment.facebookClientId,
          scope: 'email',
          redirect_uri: this.redirectUrl,
          state: uuid,
        };
      case OAuthProvider.SPOTIFY:
        return {
          response_type: 'code',
          client_id: environment.spotifyClientId,
          scope: 'user-read-email user-read-private',
          redirect_uri: this.redirectUrl,
          state: uuid,
        };
      case OAuthProvider.GOOGLE:
        return {
          response_type: 'code',
          client_id: environment.googleClientId,
          scope: 'email profile',
          redirect_uri: this.redirectUrl,
          state: uuid,
        };
    }
  }

  private get redirectUrl() {
    return `https://${window.location.host}/oauth/callback`;
  }
}
