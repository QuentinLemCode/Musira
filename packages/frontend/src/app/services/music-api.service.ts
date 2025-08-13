import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed } from '@angular/core';
import { MusicService, SpotifyService } from '@musira/client';
import type { Observable, Subscription } from 'rxjs';
import { ReplaySubject, combineLatest, timer } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import type { CurrentMusic, Music } from './music-api.interface';
import { VisibilityService } from './visibility.service';

@Injectable({
  providedIn: 'root',
})
export class MusicApiService {
  private readonly currentPublicCode = computed(
    () => this.session.currentSession()?.code,
  );

  private readonly $status = new ReplaySubject<CurrentMusic>(1);

  private $polling?: Subscription;

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(VisibilityService) readonly visibility: VisibilityService,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
    @Inject(MusicService) private readonly musicApi: MusicService,
    @Inject(SpotifyService) private readonly spotifyApi: SpotifyService,
  ) {
    const pollingObservable = combineLatest([
      this.visibility.change,
      this.session.currentSession$,
    ]);
    pollingObservable.subscribe({
      next: ([visibility, session]) => {
        if (visibility.visible && session?.linkedToSpotify) {
          this.launchPolling();
        } else {
          this.stopPolling();
        }
      },
    });
  }

  search(query: string): Observable<Music[]> {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return new ReplaySubject<Music[]>(1);
    return this.musicApi.musicControllerSearch(query, publicCode);
  }

  getUrlLogin(): Observable<string> {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return new ReplaySubject<string>(1);
    return this.spotifyApi
      .spotifyLoginControllerSpotifyLogin(publicCode)
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

  startEngine() {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return this.$status.asObservable();
    return this.musicApi
      .musicControllerStart(publicCode)
      .pipe(tap((status: any) => this.$status.next(status as CurrentMusic)));
  }

  stopEngine() {
    const publicCode = this.currentPublicCode();
    if (!publicCode) return this.$status.asObservable();
    return this.musicApi
      .musicControllerStop(publicCode)
      .pipe(tap((status: any) => this.$status.next(status as CurrentMusic)));
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
    this.musicApi.musicControllerCurrentState(publicCode).subscribe({
      next: (status: any) => this.$status.next(status as CurrentMusic),
      error: (err) => this.$status.error(err),
    });
  }
}
