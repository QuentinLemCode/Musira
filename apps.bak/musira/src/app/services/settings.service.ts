import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { MusicSessionsService } from '../sessions/music-sessions.service';

export interface SettingsQuery {
  maxVotes: number;
  maxQueuableSongPerUser: number;
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly endpoint;

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
  ) {
    this.endpoint = computed(
      () =>
        environment.serverUrl +
        'session/' +
        this.session.currentSession()?.code +
        '/settings',
    );
  }

  get() {
    return this.http.get<SettingsQuery>(this.endpoint());
  }

  setMaxVote(value: number) {
    const body: Partial<SettingsQuery> = {
      maxVotes: value,
    };
    return this.http.put<SettingsQuery>(this.endpoint(), body);
  }

  setMaxQueuableSongPerUser(value: number) {
    const body: Partial<SettingsQuery> = {
      maxQueuableSongPerUser: value,
    };
    return this.http.put<SettingsQuery>(this.endpoint(), body);
  }
}
