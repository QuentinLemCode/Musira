import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import type { UserResponseDTO } from '@musira/api-interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly userEndpoint = environment.serverUrl + 'users';

  constructor(@Inject(HttpClient) private readonly http: HttpClient) {}

  getAllUsers() {
    return this.http.get<UserResponseDTO[]>(this.userEndpoint);
  }

  delete(id?: number) {
    return this.http.delete<UserResponseDTO[]>(
      this.userEndpoint + '/' + (id ?? ''),
    );
  }

  unlock(id: number) {
    return this.http.post<UserResponseDTO[]>(
      this.userEndpoint + '/email/unlock/' + id,
      {},
    );
  }
}
