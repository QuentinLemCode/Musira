import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed } from '@angular/core';
import type { Observable, Subscription } from 'rxjs';
import { ReplaySubject, combineLatest, timer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type { CurrentMusic, Music } from './music-api.interface';
import { MusicSessionsService } from './music-sessions.service';
import { VisibilityService } from './visibility.service';

@Injectable({
  providedIn: 'root',
})
export class MusicApiService {
  private readonly endpoint;
  private readonly spotifyEndpoint = environment.serverUrl + 'spotify/';

  private readonly $status = new ReplaySubject<CurrentMusic>(1);

  private $polling?: Subscription;

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(VisibilityService) readonly visibility: VisibilityService,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
  ) {
    this.endpoint = computed(
      () =>
        environment.serverUrl +
        'session/' +
        this.session.currentSession()?.code +
        '/music',
    );
    const pollingObservable = combineLatest([
      this.visibility.change,
      this.session.currentSession$,
    ]);
    pollingObservable.subscribe({
      next: ([visibility, session]) => {
        if (visibility.visible && session) {
          this.launchPolling();
        } else {
          this.stopPolling();
        }
      },
    });
  }

  search(query: string): Observable<Music[]> {
    return this.http.get<Music[]>(this.endpoint() + '/search', {
      params: { query },
    });
  }

  getUrlLogin(): Observable<string> {
    return this.http
      .get(
        this.spotifyEndpoint +
          this.session.currentSession()?.code +
          '/spotify-login',
        {
          responseType: 'text',
        },
      )
      .pipe(shareReplay(1));
  }

  authenticatePlayer(code: string, state: string) {
    return this.http.post<{ connected?: boolean; publicCode: string }>(
      this.spotifyEndpoint + 'register-player',
      {
        code,
        state,
      },
    );
  }

  logoutPlayer() {
    return this.http.post(
      this.spotifyEndpoint +
        this.session.currentSession()?.code +
        '/logout-player',
      {},
    );
  }

  getStatus() {
    return this.$status.asObservable();
  }

  startEngine() {
    return this.http.get<CurrentMusic>(this.endpoint() + '/start');
  }

  stopEngine() {
    return this.http.get<CurrentMusic>(this.endpoint() + '/stop');
  }

  private launchPolling() {
    if (this.$polling && !this.$polling.closed) return;
    this.$polling = timer(0, 5000).subscribe(() => {
      this.loadStatus();
    });
  }

  private stopPolling() {
    this.$polling?.unsubscribe();
  }

  private loadStatus() {
    this.http.get<CurrentMusic>(this.endpoint()).subscribe({
      next: (status) => {
        this.$status.next(status);
      },
      error: (err) => {
        this.$status.error(err);
      },
    });
  }
}
