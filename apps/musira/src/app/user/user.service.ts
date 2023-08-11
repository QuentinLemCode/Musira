import { SocialAuthService } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import type {
  SocialLoginUserDTO,
  UserResponseDTO,
} from '@musira/api-interfaces/index';
import { catchError, lastValueFrom, tap, throwError } from 'rxjs';
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
  private readonly usersEndpoint = environment.serverUrl + 'users/';
  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(SocialAuthService) private readonly authService: SocialAuthService,
  ) {}

  socialLogin(user: SocialLoginUserDTO, token: string) {
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + 'social/login', user)
      .pipe(
        tap((response) => {
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
        tap((token) => {
          this.saveLogin(token);
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

  refreshToken() {
    const body = {
      token: this.savedRefreshToken,
    };
    return this.http
      .post<UserResponseDTO>(this.usersEndpoint + 'email/refresh', body)
      .pipe(
        tap((login) => this.saveLogin(login)),
        catchError((err) => {
          this.clearLocalStorage();
          return throwError(() => err);
        }),
      );
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
    // if (this.isTokenExpired()) return false;
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
