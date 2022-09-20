import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subscription, timer } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CurrentMusic, Music } from './music-api.interface';
import { VisibilityService } from './visibility.service';

interface Control {
  start: boolean;
  logout?: boolean;
}
@Injectable({
  providedIn: 'root',
})
export class MusicApiService {
  private readonly endpoint = environment.serverUrl + 'music';

  private readonly $status = new ReplaySubject<CurrentMusic>(1);

  private $polling?: Subscription;

  constructor(
    private readonly http: HttpClient,
    readonly visibility: VisibilityService
  ) {
    visibility.change.subscribe({
      next: (status) => {
        if (status.visible) {
          this.launchPolling();
        } else {
          this.stopPolling();
        }
      },
    });
  }

  search(query: string): Observable<Music[]> {
    return this.http.get<Music[]>(this.endpoint + '/search', {
      params: { query },
    });
  }

  getUrlLogin(): Observable<string> {
    return this.http
      .get(this.endpoint + '/spotify-login', {
        responseType: 'text',
      })
      .pipe(shareReplay(1));
  }

  authenticatePlayer(code: string) {
    return this.http.post<CurrentMusic>(this.endpoint + '/register-player', {
      code,
    });
  }

  getStatus() {
    return this.$status.asObservable();
  }

  setEngine(start: boolean) {
    const body: Control = {
      start,
    };
    return this.http.post<CurrentMusic>(this.endpoint, body);
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
    this.http.get<CurrentMusic>(this.endpoint).subscribe({
      next: (status) => {
        this.$status.next(status);
      },
      error: (err) => {
        this.$status.error(err);
      },
    });
  }
}
