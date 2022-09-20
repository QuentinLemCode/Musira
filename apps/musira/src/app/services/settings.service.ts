import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private endpoint = environment.serverUrl + 'settings';

  constructor(private readonly http: HttpClient) {}

  get() {
    return this.http.get<SettingsQuery>(this.endpoint);
  }

  setMaxVote(value: number) {
    const body: Partial<SettingsQuery> = {
      maxVotes: value,
    };
    return this.http.put<SettingsQuery>(this.endpoint, body);
  }

  setMaxQueuableSongPerUser(value: number) {
    const body: Partial<SettingsQuery> = {
      maxQueuableSongPerUser: value,
    };
    return this.http.put<SettingsQuery>(this.endpoint, body);
  }
}
