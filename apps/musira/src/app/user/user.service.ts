import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, signal } from '@angular/core';
import type {
  EmailRefreshResponseDTO,
  UserResponseDTO,
} from '@musira/api-interfaces/index';
import { SocialLoginUserDTO } from '@musira/api-interfaces/index';
import { catchError, defer, interval, lastValueFrom, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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
  token: string;
}

interface SocialUserState extends BaseUserState {
  type: 'SOCIAL';
  provider: string;
  isAdmin: false;
}

interface EmailUserState extends BaseUserState {
  type: 'EMAIL';
  isAdmin: boolean;
}

export type UserState =
  | ({ isLoggedIn: true } & (SocialUserState | EmailUserState))
  | {
      isLoggedIn: false;
    };

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public loggedUser = signal<UserState>(this.userState);

  private readonly usersEndpoint = environment.serverUrl + 'users';
  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(SocialAuthService) private readonly authService: SocialAuthService,
  ) {
    this.authService.authState.subscribe({
      next: (user) => {
        if (user === null) return;
        this.socialLogin(
          new SocialLoginUserDTO(user),
          user.idToken,
        ).subscribe();
      },
    });
    if (this.isTokenExpired) {
      this.refreshEmailToken().subscribe();
    }
    interval(1000 * 60 * 30).subscribe({
      next: () => {
        this.refreshTokenFromServer().subscribe();
      },
    });
  }

  socialLogin(user: SocialLoginUserDTO, token: string) {
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + '/social/login', user)
      .pipe(
        tap((response) => {
          this.saveLogin(response, token, this.getExpiresAtFromToken(token));
        }),
      );
  }

  emailLogin(email: string, password: string) {
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + '/email/login', {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.saveLogin(response);
        }),
      );
  }

  emailRegister(email: string, username: string, password: string) {
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + '/email/register', {
        email,
        username,
        password,
      })
      .pipe(
        tap((token) => {
          this.saveLogin(token);
        }),
      );
  }

  async logout() {
    if (this.isSocialLogin) await this.authService.signOut(true);
    if (this.isEmailLogin) await this.emailLogout();
    this.clearLocalStorage();
    this.loggedUser.set({
      isLoggedIn: false,
    });
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

  private refreshTokenFromServer() {
    if (!this.loggedUser().isLoggedIn) return of(false);
    if (this.isEmailLogin) {
      return this.refreshEmailToken();
    }
    return of(true);
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

  private getExpiresAtFromToken(token: string) {
    const payload = token.split('.')[1];
    if (!payload) throw new Error('No payload found');
    const decodedPayload = atob(payload);
    const expiresAt: string = JSON.parse(decodedPayload).exp;
    return Number.parseInt(expiresAt, 10);
  }

  private refreshEmailToken() {
    const body = {
      token: this.refreshToken,
    };
    return this.http
      .post<EmailRefreshResponseDTO>(
        this.usersEndpoint + '/email/refresh',
        body,
      )
      .pipe(
        tap((refresh) => this.saveRefresh(refresh)),
        map(() => true),
        catchError((err) => {
          this.clearLocalStorage();
          this.loggedUser.set({
            isLoggedIn: false,
          });
          console.error(err);
          return of(false);
        }),
      );
  }

  private refreshSocialToken() {
    const provider = this.provider;
    if (provider === null) {
      throw new Error('No provider found');
    }
    return defer(async () => {
      try {
        await this.authService.refreshAuthToken(provider);
      } catch (error) {
        this.clearLocalStorage();
        this.loggedUser.set({
          isLoggedIn: false,
        });
        return false;
      }
      return true;
    });
  }

  private get userState(): UserState {
    if (!this.username || !this.userId || !this.type || !this.token) {
      return {
        isLoggedIn: false,
      };
    }
    const state = {
      username: this.username,
      userId: this.userId,
      token: this.token,
    };
    if (this.type === 'EMAIL') {
      return {
        ...state,
        type: this.type,
        isAdmin: this.isAdmin,
        isLoggedIn: true,
      };
    }
    if (this.type === 'SOCIAL' && this.provider) {
      return {
        ...state,
        type: this.type,
        provider: this.provider,
        isAdmin: false,
        isLoggedIn: true,
      };
    }
    return {
      isLoggedIn: false,
    };
  }

  private get provider(): string | null {
    return localStorage.getItem(LocalStorageKeys.PROVIDER);
  }

  private get isSocialLogin(): boolean {
    return this.type === 'SOCIAL';
  }

  private get isEmailLogin(): boolean {
    return this.type === 'EMAIL';
  }

  private get type(): 'EMAIL' | 'SOCIAL' | null {
    const item = localStorage.getItem(LocalStorageKeys.TYPE);
    if (item === 'EMAIL' || item === 'SOCIAL') {
      return item;
    }
    return null;
  }

  private get username(): string | null {
    return localStorage.getItem(LocalStorageKeys.USERNAME);
  }

  private get userId(): string | null {
    return localStorage.getItem(LocalStorageKeys.USER_ID);
  }

  private get expires_at(): number | null {
    const lsItem = localStorage.getItem(LocalStorageKeys.EXPIRES_AT);
    if (lsItem === null) {
      return null;
    }
    return +lsItem;
  }

  private get refreshToken(): string | null {
    return localStorage.getItem(LocalStorageKeys.REFRESH_TOKEN);
  }

  private get token() {
    return localStorage.getItem(LocalStorageKeys.TOKEN);
  }

  private get isTokenExpired() {
    return !this.expires_at || this.expires_at <= this.now();
  }

  private get isAdmin() {
    return localStorage.getItem(LocalStorageKeys.ROLE) === '1';
  }

  private emailLogout() {
    return lastValueFrom(
      this.http.post(this.usersEndpoint + '/email/logout/' + this.userId, ''),
    );
  }

  private now() {
    return Math.floor(Date.now() / 1000);
  }

  private clearLocalStorage() {
    Object.values(LocalStorageKeys).forEach((val) => {
      localStorage.removeItem(val);
    });
  }

  private saveRefresh(refresh: EmailRefreshResponseDTO) {
    localStorage.setItem(LocalStorageKeys.TOKEN, refresh.token);
    localStorage.setItem(LocalStorageKeys.REFRESH_TOKEN, refresh.refreshToken);
    localStorage.setItem(LocalStorageKeys.EXPIRES_AT, '' + refresh.expiresAt);
    this.loggedUser.set(this.userState);
  }

  private saveLogin(
    login: UserResponseDTO,
    token?: string,
    expires_at?: number,
  ) {
    localStorage.setItem(LocalStorageKeys.USERNAME, login.name);
    localStorage.setItem(LocalStorageKeys.USER_ID, '' + login.id);
    localStorage.setItem(
      LocalStorageKeys.SESSIONS_CREATOR,
      login.sessionCreatedIds.join(';'),
    );
    localStorage.setItem(LocalStorageKeys.TYPE, login.type);
    localStorage.setItem(LocalStorageKeys.ROLE, '' + login.role);
    if (login.type === 'SOCIAL' && token) {
      localStorage.setItem(LocalStorageKeys.TOKEN, token);
      localStorage.setItem(LocalStorageKeys.PROVIDER, login.provider);
      localStorage.setItem(LocalStorageKeys.EXPIRES_AT, '' + expires_at);
    }
    if (login.type === 'EMAIL') {
      localStorage.setItem(LocalStorageKeys.EXPIRES_AT, '' + login.expiresAt);
      localStorage.setItem(LocalStorageKeys.TOKEN, login.token);
      localStorage.setItem(LocalStorageKeys.REFRESH_TOKEN, login.refreshToken);
      localStorage.setItem(LocalStorageKeys.EMAIL, login.email);
    }
    this.loggedUser.set(this.userState);
  }
}
