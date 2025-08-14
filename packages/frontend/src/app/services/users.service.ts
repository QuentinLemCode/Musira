import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import {
  UnlockService as ApiUnlockService,
  UsersService as ApiUsersService,
} from '@musira/client';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly userEndpoint = environment.serverUrl + 'users';

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(ApiUsersService) private readonly apiUsers: ApiUsersService,
    @Inject(ApiUnlockService) private readonly apiUnlock: ApiUnlockService,
  ) {}

  getAllUsers() {
    return this.apiUsers.usersControllerGetAll() as unknown as ReturnType<
      typeof this.apiUsers.usersControllerGetAll
    >;
  }

  delete(id?: number) {
    if (id == null) {
      return this.apiUsers.usersControllerDeleteSelf() as unknown as ReturnType<
        typeof this.apiUsers.usersControllerDeleteSelf
      >;
    }
    return this.apiUsers.usersControllerDeleteById(
      String(id),
    ) as unknown as ReturnType<typeof this.apiUsers.usersControllerDeleteById>;
  }

  unlock(id: number) {
    return this.apiUnlock.unlockControllerUnlock(
      String(id),
    ) as unknown as ReturnType<typeof this.apiUnlock.unlockControllerUnlock>;
  }
}
