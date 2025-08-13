import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed } from '@angular/core';
import {
  BacklogService as ApiBacklogService,
  QueueService as ApiQueueService,
} from '@musira/client';
import type { Subscription } from 'rxjs';
import { ReplaySubject, combineLatest, of, timer } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import type {
  Backlog,
  FullBacklog,
  Music,
  Queue,
  QueueResponse,
} from './music-api.interface';
import { VisibilityService } from './visibility.service';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  private readonly queueEndpoint;
  private readonly backlogEndpoint;
  private readonly $queue = new ReplaySubject<Queue[]>(1);
  private readonly $backlog = new ReplaySubject<Backlog | null>(1);

  private cacheFullBacklog: null | {
    timestamp: number;
    backlog: FullBacklog[];
  } = null;

  private $polling?: Subscription;

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(VisibilityService) readonly visibility: VisibilityService,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
    @Inject(ApiQueueService) private readonly apiQueue: ApiQueueService,
    @Inject(ApiBacklogService) private readonly apiBacklog: ApiBacklogService,
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
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(null);
    return this.apiQueue
      .queueControllerPushToQueue(publicCode, music as unknown as object)
      .pipe(
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
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of([]);
    if (
      !this.cacheFullBacklog ||
      this.cacheFullBacklog.timestamp > Date.now() - 10000
    ) {
      return this.apiBacklog.backlogControllerGetBackLog(publicCode).pipe(
        tap((backlog: any) => {
          this.cacheFullBacklog = {
            timestamp: Date.now(),
            backlog: backlog as FullBacklog[],
          };
        }),
      );
    }
    return of(this.cacheFullBacklog.backlog);
  }

  public importPlaylist(code: number, spotifyPlaylistId: string) {
    return this.apiBacklog.backlogControllerImport(code);
  }

  pushBacklog(music: Music) {
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of([]);
    return this.apiBacklog.backlogControllerPushToBacklog(
      publicCode,
      music as unknown as object,
    ) as unknown as any;
  }

  forward(id: string | number) {
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(null);
    return this.apiQueue
      .queueControllerForwardQueue(String(id), publicCode)
      .pipe(
        tap(() => {
          this.loadQueue();
        }),
      );
  }

  delete(id: string | number) {
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(null);
    return this.apiQueue
      .queueControllerDeleteFromQueue(String(id), publicCode)
      .pipe(
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
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(null);
    return this.apiBacklog.backlogControllerDeleteBacklog(
      String(id),
      publicCode,
    );
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
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return;
    this.apiQueue.queueControllerGetQueue(publicCode).subscribe({
      next: (response) => {
        const data = response as unknown as QueueResponse;
        this.$queue.next(data.queue);
        this.$backlog.next(data.backlog);
      },
      error: (err) => {
        this.$queue.error(err);
        this.$backlog.error(err);
      },
    });
  }
}
