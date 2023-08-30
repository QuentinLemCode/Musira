import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed } from '@angular/core';
import type { Subscription } from 'rxjs';
import { ReplaySubject, combineLatest, timer } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import type {
  Backlog,
  Music,
  Queue,
  QueueResponse,
} from './music-api.interface';
import { VisibilityService } from './visibility.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  private readonly queueEndpoint;
  private readonly backlogEndpoint;
  private readonly $queue = new ReplaySubject<Queue[]>(1);
  private readonly $backlog = new ReplaySubject<Backlog | null>(1);

  private $polling?: Subscription;

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(VisibilityService) readonly visibility: VisibilityService,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
  ) {
    this.queueEndpoint = computed(
      () =>
        environment.serverUrl +
        'session/' +
        this.session.currentSession()?.code +
        '/queue',
    );
    this.backlogEndpoint = computed(
      () =>
        environment.serverUrl +
        'session/' +
        this.session.currentSession()?.code +
        '/backlog',
    );
    const pollingObservable = combineLatest([
      this.visibility.change,
      this.session.currentSession$,
    ]);
    pollingObservable.subscribe({
      next: ([visibility, session]) => {
        if (visibility.visible && session?.linkedToSpotify) {
          this.launchPolling();
        } else {
          if (!session?.linkedToSpotify) {
            this.$queue.next([]);
            this.$backlog.next(null);
          }
          this.stopPolling();
        }
      },
    });
  }

  push(music: Music) {
    return this.http.post(this.queueEndpoint(), music).pipe(
      tap(() => {
        this.loadQueue();
      }),
    );
  }

  get() {
    return this.$queue.asObservable();
  }

  getBacklog() {
    return this.$backlog.asObservable();
  }

  getFullBacklog() {
    return this.http.get<Backlog[]>(this.backlogEndpoint());
  }

  pushBacklog(music: Music) {
    return this.http.post(this.backlogEndpoint(), music);
  }

  forward(id: string | number) {
    return this.http
      .post(this.queueEndpoint() + '/' + id + '/forward', {})
      .pipe(
        tap(() => {
          this.loadQueue();
        }),
      );
  }

  delete(id: string | number) {
    return this.http.delete(this.queueEndpoint() + '/' + id).pipe(
      tap(() => {
        this.$queue.pipe(first()).subscribe({
          next: (queue) => {
            const index = queue.findIndex((q) => q.id === id);
            if (index !== -1) {
              queue.splice(index, 1);
            }
          },
        });
      }),
    );
  }

  deleteBacklog(id: string | number) {
    return this.http.delete(this.backlogEndpoint() + '/' + id);
  }

  private launchPolling() {
    if (this.$polling && !this.$polling.closed) return;
    this.$polling = timer(0, 10000).subscribe(() => {
      this.loadQueue();
    });
  }

  private stopPolling() {
    this.$polling?.unsubscribe();
  }

  private loadQueue() {
    this.http.get<QueueResponse>(this.queueEndpoint()).subscribe({
      next: (response) => {
        this.$queue.next(response.queue);
        this.$backlog.next(response.backlog);
      },
      error: (err) => {
        this.$queue.error(err);
        this.$backlog.error(err);
      },
    });
  }
}
