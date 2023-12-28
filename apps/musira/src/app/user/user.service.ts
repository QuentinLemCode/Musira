import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import type { JwtUser, UserResponseDTO } from '@musira/api-interfaces/index';
import { SocialLoginUserDTO } from '@musira/api-interfaces/index';
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

enum SessionStorageKeys {
  USER = 'user',
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
export class UserService {
  public loggedUser = signal<UserState>(this.getSession());
  private readonly usersEndpoint = environment.serverUrl + 'auth';

  constructor(
    private readonly http: HttpClient,
    private readonly storage: StorageService,
  ) {}

  emailProfile() {
    return this.http.get<JwtUser>(this.usersEndpoint + '/email/profile', {
      withCredentials: true,
    });
  }

  socialLogin(user: SocialLoginUserDTO) {
    return this.http.post<UserResponseDTO>(
      this.usersEndpoint + '/social/login',
      user,
    );
  }

  emailLogin(email: string, password: string) {
    return this.http
      .post<JwtUser>(this.usersEndpoint + '/email/login', {
        email,
        password,
      })
      .pipe(
        tap((data) => {
          this.saveSession(data);
        }),
      );
  }

  emailRegister(email: string, username: string, password: string) {
    return this.http.post<UserResponseDTO>(
      this.usersEndpoint + '/email/register',
      {
        email,
        username,
        password,
      },
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
    const user = this.storage.getSessionItem<string>(SessionStorageKeys.USER);
    if (!user) {
      return {
        isLoggedIn: false,
      };
    }
    const parsedUser: JwtUser = JSON.parse(user);
    return {
      isLoggedIn: true,
      username: parsedUser.name,
      userId: parsedUser.email,
      admin: parsedUser.admin,
    };
  }

  private saveSession(user: JwtUser) {
    this.storage.setSessionItem(SessionStorageKeys.USER, JSON.stringify(user));
    this.loggedUser.set({
      isLoggedIn: true,
      username: user.name,
      userId: user.email,
      admin: user.admin,
    });
  }

  async logout() {
    this.storage.clearSession();
    this.loggedUser.set({
      isLoggedIn: false,
    });
  }
}
