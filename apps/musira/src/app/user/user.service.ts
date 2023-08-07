import { SocialUser } from '@abacritt/angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
  constructor(private readonly http: HttpClient) {}

  enrollUser(user: SocialUser) {
    this.http.post('http://localhost:3000/api/user', user).subscribe();
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
