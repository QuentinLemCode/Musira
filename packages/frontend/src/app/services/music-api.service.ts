import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed } from '@angular/core';
import type { CurrentMusicDto, MusicDto } from '@musira/client';
import { MusicService, SpotifyService } from '@musira/client';
import type { Observable, Subscription } from 'rxjs';
import { EMPTY, ReplaySubject, combineLatest, of, timer } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { VisibilityService } from './visibility.service';

@Injectable({
  providedIn: 'root',
})
export class MusicApiService {
  private readonly currentPublicCode = computed(
    () => this.session.currentSession()?.code,
  );

  private readonly $status = new ReplaySubject<CurrentMusicDto>(1);

  private $polling?: Subscription;

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(VisibilityService) readonly visibility: VisibilityService,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
    @Inject(MusicService) private readonly musicApi: MusicService,
    @Inject(SpotifyService) private readonly spotifyApi: SpotifyService,
  ) {
    // Provide an initial status to avoid indefinite "Chargement" in the UI
    this.$status.next({
      engineStarted: false,
      isSpotifyAccountRegistered: false,
    });
    const pollingObservable = combineLatest([
      this.visibility.change,
      this.session.currentSession$,
    ]);
    pollingObservable.subscribe({
      next: ([visibility, session]) => {
        if (visibility.visible && session?.linkedToSpotify) {
          this.launchPolling();
        } else {
          // When not linked to Spotify, expose a deterministic status
          this.$status.next({
            engineStarted: false,
            isSpotifyAccountRegistered: false,
          });
          this.stopPolling();
        }
      },
    });
  }

  search(query: string): Observable<MusicDto[]> {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return of([]);
    return this.musicApi.musicControllerSearch(query, publicCode, 'body');
  }

  getUrlLogin(): Observable<string> {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return EMPTY;
    const url = `${environment.serverUrl}spotify/${publicCode}/spotify-login`;
    return this.http
      .get(url, { responseType: 'text', withCredentials: true })
      .pipe(shareReplay(1));
  }

  authenticatePlayer(code: string, state: string) {
    // OpenAPI spec does not include request body for this endpoint, so we fallback to HttpClient directly.
    return this.http.post<{ connected?: boolean; publicCode: string }>(
      environment.serverUrl + 'spotify/register-player',
      { code, state },
    );
  }

  logoutPlayer() {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return this.$status.asObservable();
    return this.spotifyApi.spotifyLoginControllerSpotifyLogout(publicCode).pipe(
      tap(() => {
        this.$status.next({
          engineStarted: false,
          isSpotifyAccountRegistered: false,
        });
      }),
    );
  }

  getStatus() {
    return this.$status.asObservable();
  }

  startEngine(): Observable<CurrentMusicDto> {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return this.$status.asObservable();
    return this.musicApi
      .musicControllerStart(publicCode, 'body')
      .pipe(tap((status: CurrentMusicDto) => this.$status.next(status)));
  }

  stopEngine(): Observable<CurrentMusicDto> {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return this.$status.asObservable();
    return this.musicApi
      .musicControllerStop(publicCode, 'body')
      .pipe(tap((status: CurrentMusicDto) => this.$status.next(status)));
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
    const publicCode = this.currentPublicCode();
    if (!publicCode) return;
    this.musicApi.musicControllerCurrentState(publicCode, 'body').subscribe({
      next: (status: CurrentMusicDto) => this.$status.next(status),
      error: (err) => console.warn('Failed to refresh player status', err),
    });
  }
}
