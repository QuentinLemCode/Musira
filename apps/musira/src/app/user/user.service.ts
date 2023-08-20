import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import type {
  EmailRefreshResponseDTO,
  UserResponseDTO,
} from '@musira/api-interfaces/index';
import { SocialLoginUserDTO } from '@musira/api-interfaces/index';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  lastValueFrom,
  tap,
  throwError,
} from 'rxjs';
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
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly userLoginSubject =
    new BehaviorSubject<UserResponseDTO | null>(null);
  public readonly userLogin$ = this.userLoginSubject.asObservable();

  private readonly usersEndpoint = environment.serverUrl + 'users/';
  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(SocialAuthService) private readonly authService: SocialAuthService,
  ) {
    this.authService.authState.subscribe((user) => {
      if (user === null) return;
      this.socialLogin(new SocialLoginUserDTO(user), user.idToken).subscribe();
    });
  }

  socialLogin(user: SocialLoginUserDTO, token: string) {
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + 'social/login', user)
      .pipe(
        tap((response) => {
          this.userLoginSubject.next(response);
          this.saveLogin(response, token);
        }),
      );
  }

  emailLogin(email: string, password: string) {
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + 'email/login', {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          this.userLoginSubject.next(response);
          this.saveLogin(response);
        }),
      );
  }

  emailRegister(email: string, username: string, password: string) {
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + 'email/register', {
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
    if (this.isSocialLogin) await this.authService.signOut();
    if (this.isEmailLogin) await this.emailLogout();
    this.clearLocalStorage();
  }

  getAllUsers() {
    return this.http.get<UserResponseDTO[]>(this.usersEndpoint);
  }

  delete(id: number) {
    return this.http.delete<UserResponseDTO[]>(this.usersEndpoint + id);
  }

  unlock(id: number) {
    return this.http.post<UserResponseDTO[]>(
      this.usersEndpoint + 'email/unlock/' + id,
      {},
    );
  }

  refreshEmailToken() {
    const body = {
      token: this.savedRefreshToken,
    };
    return this.http
      .post<EmailRefreshResponseDTO>(this.usersEndpoint + 'email/refresh', body)
      .pipe(
        tap((refresh) => this.saveRefresh(refresh)),
        catchError((err) => {
          this.clearLocalStorage();
          return throwError(() => err);
        }),
      );
  }

  async refreshSocialToken() {
    const provider = this.provider;
    if (provider === null) {
      throw new Error('No provider found');
    }
    return this.authService.refreshAuthToken(provider);
  }

  get provider(): string | null {
    return localStorage.getItem(LocalStorageKeys.PROVIDER);
  }

  get isSocialLogin(): boolean {
    return this.type === 'SOCIAL';
  }

  get isEmailLogin(): boolean {
    return this.type === 'EMAIL';
  }

  get type(): string | null {
    return localStorage.getItem(LocalStorageKeys.TYPE);
  }

  get username(): string | null {
    if (this.isLoggedIn) {
      return localStorage.getItem(LocalStorageKeys.USERNAME);
    }
    return null;
  }

  get userId(): string | null {
    return localStorage.getItem(LocalStorageKeys.USER_ID);
  }

  get isLoggedIn(): boolean {
    const authToken = this.getToken();
    if (authToken === null) return false;
    if (this.isTokenExpired()) return false;
    return true;
  }

  get expires_at(): number | null {
    const lsItem = localStorage.getItem(LocalStorageKeys.EXPIRES_AT);
    if (lsItem === null) {
      return null;
    }
    return +lsItem;
  }

  get savedRefreshToken(): string | null {
    return localStorage.getItem(LocalStorageKeys.REFRESH_TOKEN);
  }

  async refreshTokenIfExpired(): Promise<boolean> {
    if (!this.isTokenExpired) return true;
    if (this.isEmailLogin) {
      try {
        await firstValueFrom(this.refreshEmailToken());
        return true;
      } catch {
        return false;
      }
    }
    try {
      await this.refreshSocialToken();
    } catch {
      return false;
    }
    return true;
  }

  getToken() {
    return localStorage.getItem(LocalStorageKeys.TOKEN);
  }

  isTokenExpired() {
    return !this.expires_at || this.expires_at <= this.now();
  }

  isAdmin() {
    if (!this.isLoggedIn) {
      return false;
    }
    return localStorage.getItem(LocalStorageKeys.ROLE) === 'admin';
  }

  isSessionCreator(session: string) {
    if (!this.isLoggedIn) {
      return false;
    }
    const sessions = localStorage
      .getItem(LocalStorageKeys.SESSIONS_CREATOR)
      ?.split(';');
    return sessions?.includes(session) ?? false;
  }

  private emailLogout() {
    return lastValueFrom(
      this.http.post(this.usersEndpoint + 'email/logout/' + this.userId, ''),
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
  }

  private saveLogin(login: UserResponseDTO, token?: string) {
    localStorage.setItem(LocalStorageKeys.USERNAME, login.name);
    localStorage.setItem(LocalStorageKeys.USER_ID, '' + login.id);
    localStorage.setItem(
      LocalStorageKeys.SESSIONS_CREATOR,
      login.sessionCreatedIds.join(';'),
    );
    localStorage.setItem(LocalStorageKeys.EXPIRES_AT, '' + login.expiresAt);
    localStorage.setItem(LocalStorageKeys.TYPE, login.type);
    localStorage.setItem(LocalStorageKeys.ROLE, '' + login.role);
    if (login.type === 'SOCIAL' && token) {
      localStorage.setItem(LocalStorageKeys.TOKEN, token);
      localStorage.setItem(LocalStorageKeys.PROVIDER, login.provider);
    }
    if (login.type === 'EMAIL') {
      localStorage.setItem(LocalStorageKeys.TOKEN, login.token);
      localStorage.setItem(LocalStorageKeys.REFRESH_TOKEN, login.refreshToken);
      localStorage.setItem(LocalStorageKeys.EMAIL, login.email);
    }
  }
}
