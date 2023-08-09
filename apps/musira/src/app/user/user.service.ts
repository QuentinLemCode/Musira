import type { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

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
  constructor(@Inject(HttpClient) private readonly http: HttpClient) {}

  socialLogin(user: SocialUser) {
    this.http.post('http://localhost:3000/api/user/social', user).subscribe();
  }

  emailLogin(email: string, password: string) {
    this.http
      .post('http://localhost:3000/api/user/email/login', { email, password })
      .subscribe();
  }

  emailRegister(email: string, username: string, password: string) {
    this.http
      .post('http://localhost:3000/api/user/email/register', {
        email,
        username,
        password,
      })
      .subscribe();
  }

  logout() {
    this.clearLocalStorage();
  }

  private clearLocalStorage() {
    Object.values(LocalStorageKeys).forEach((val) => {
      localStorage.removeItem(val);
    });
  }
}
