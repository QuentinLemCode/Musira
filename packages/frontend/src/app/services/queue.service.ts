import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed } from '@angular/core';
import type {
  BacklogDtoDto,
  FullBacklogDtoDto,
  MusicDtoDto,
  QueueDtoDto,
  QueueResponseDtoDto,
} from '@musira/client';
import {
  BacklogService as ApiBacklogService,
  QueueService as ApiQueueService,
} from '@musira/client';
import type { Subscription } from 'rxjs';
import { ReplaySubject, combineLatest, map, of, timer } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MusicSessionsService } from '../sessions/music-sessions.service';
import { VisibilityService } from './visibility.service';

@Injectable({
  providedIn: 'root',
})
export class QueueService {
  private readonly queueEndpoint;
  private readonly backlogEndpoint;
  private readonly $queue = new ReplaySubject<QueueDtoDto[]>(1);
  private readonly $backlog = new ReplaySubject<BacklogDtoDto | null>(1);

  private cacheFullBacklog: null | {
    timestamp: number;
    backlog: FullBacklogDtoDto[];
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

  push(music: MusicDtoDto) {
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(void 0);
    return this.apiQueue
      .queueControllerPushToQueue(
        publicCode,
        music as unknown as object,
        'body',
      )
      .pipe(
        tap(() => {
          this.loadQueue();
        }),
        map(() => void 0),
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
      return this.apiBacklog
        .backlogControllerGetBackLog(publicCode, 'body')
        .pipe(
          tap((backlog: FullBacklogDtoDto[]) => {
            this.cacheFullBacklog = {
              timestamp: Date.now(),
              backlog,
            };
          }),
        );
    }
    return of(this.cacheFullBacklog.backlog);
  }

  public importPlaylist(code: number, spotifyPlaylistId: string) {
    return this.apiBacklog.backlogControllerImport(code, { spotifyPlaylistId });
  }

  pushBacklog(music: MusicDtoDto) {
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(void 0);
    return this.apiBacklog
      .backlogControllerPushToBacklog(
        publicCode,
        music as unknown as object,
        'body',
      )
      .pipe(map(() => void 0));
  }

  forward(id: string | number) {
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(void 0);
    return this.apiQueue
      .queueControllerForwardQueue(String(id), publicCode, 'body')
      .pipe(
        tap(() => {
          this.loadQueue();
        }),
        map(() => void 0),
      );
  }

  delete(id: string | number) {
    const publicCode = this.session.currentSession()?.code;
    if (!publicCode) return of(void 0);
    return this.apiQueue
      .queueControllerDeleteFromQueue(String(id), publicCode, 'body')
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
        map(() => void 0),
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
    this.apiQueue.queueControllerGetQueue(publicCode, 'body').subscribe({
      next: (response: QueueResponseDtoDto) => {
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
