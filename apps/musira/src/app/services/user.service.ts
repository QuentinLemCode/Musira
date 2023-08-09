import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { FullUser } from '../interfaces/user';
import type { UserLogin } from '../interfaces/user-login';

enum LocalStorageKeys {
  TOKEN = 'token',
  USER = 'user',
  EXPIRES_AT = 'expires_at',
  ROLE = 'role',
  REFRESH_TOKEN = 'refresh_token',
  USER_ID = 'user_id',
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userEndpoint = environment.serverUrl + 'users';
  private authEndpoint = environment.serverUrl + 'auth';

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(Router) private router: Router,
  ) {}

  register(name: string, challenge: string) {
    return this.http
      .post<UserLogin>(this.userEndpoint + '/register', {
        name,
        challenge,
      })
      .pipe(
        tap((token) => {
          this.saveLogin(token);
        }),
      );
  }

  login(name: string) {
    return this.callLogin(name);
  }

  loginWithPassword(name: string, password: string) {
    return this.callLogin(name, password);
  }

  loginWithChallenge(name: string, challenge: string) {
    return this.callLogin(name, undefined, challenge);
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

  logout() {
    return this.http
      .post(this.authEndpoint + '/logout/' + this.userId, '')
      .pipe(
        finalize(() => {
          this.clearLocalStorage();
          this.router.navigate(['/login']);
        }),
      );
  }

  getAllUsers() {
    return this.http.get<FullUser[]>(this.userEndpoint);
  }

  unlock(id: number) {
    return this.http.post(this.userEndpoint + '/' + id + '/unlock', {});
  }

  delete(id: number) {
    return this.http.delete(this.userEndpoint + '/' + id);
  }

  toggleIPVerification(id: number) {
    return this.http.post(
      this.userEndpoint + '/' + id + '/toggle-ip-verification',
      {},
    );
  }

  refreshToken() {
    const body = {
      token: this.savedRefreshToken,
    };
    return this.http.post<UserLogin>(this.authEndpoint + '/refresh', body).pipe(
      tap((login) => this.saveLogin(login)),
      catchError((err) => {
        this.clearLocalStorage();
        this.router.navigate(['/login']);
        return throwError(err);
      }),
    );
  }

  get username(): string | null {
    if (this.isLoggedIn) {
      return localStorage.getItem(LocalStorageKeys.USER);
    }
    return null;
  }

  get userId(): string | null {
    return localStorage.getItem(LocalStorageKeys.USER_ID);
  }

  get isLoggedIn(): boolean {
    const authToken = this.getToken();
    return authToken !== null ? true : false;
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

  private now() {
    return Math.floor(Date.now() / 1000);
  }

  private saveLogin(login: UserLogin) {
    localStorage.setItem(LocalStorageKeys.USER, login.username);
    localStorage.setItem(LocalStorageKeys.EXPIRES_AT, '' + login.expires_at);
    localStorage.setItem(LocalStorageKeys.TOKEN, login.access_token);
    localStorage.setItem(LocalStorageKeys.ROLE, login.role);
    localStorage.setItem(LocalStorageKeys.REFRESH_TOKEN, login.refresh_token);
    localStorage.setItem(LocalStorageKeys.USER_ID, '' + login.id);
  }

  private clearLocalStorage() {
    Object.values(LocalStorageKeys).forEach((val) => {
      localStorage.removeItem(val);
    });
  }

  private callLogin(name: string, password?: string, challenge?: string) {
    return this.http
      .post<UserLogin>(this.authEndpoint + '/login', {
        name,
        password,
        challenge,
      })
      .pipe(
        tap((token) => {
          this.saveLogin(token);
        }),
      );
  }
}
