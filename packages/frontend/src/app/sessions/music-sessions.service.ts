import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import type {
  CreateMusicSessionDto,
  DeletedMusicSessionDto,
  MusicSessionDto,
  UpdateMusicSessionDto,
} from '@musira/api';
import { EMPTY, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface SessionHistory {
  musicSession: MusicSessionDto;
  access_date: Date;
}

@Injectable({
  providedIn: 'root',
})
export class MusicSessionsService {
  private readonly endpoint = environment.serverUrl + 'music-session';

  public currentSession = signal<MusicSessionDto | null>(null);
  public isCreator = computed(() => {
    const session = this.currentSession();
    if (!session) return false;
    return session.isCreator;
  });
  public currentSession$ = toObservable(this.currentSession);

  constructor(
    @Inject(HttpClient) private readonly http: HttpClient,
    @Inject(Router) private readonly router: Router,
  ) {
    this.router.events.subscribe({
      next: (event) => {
        if (event.type === 14) {
          const code = event.snapshot.paramMap.get('sessionId');
          if (!code) {
            this.currentSession.set(null);
          } else {
            this.joinSession(Number.parseInt(code, 10)).subscribe();
          }
        }
      },
    });
  }

  public create(musicSessionDto: CreateMusicSessionDto) {
    return this.http
      .post<MusicSessionDto>(this.endpoint, musicSessionDto)
      .pipe(this.tapCurrentSession);
  }

  public update(musicSessionDto: UpdateMusicSessionDto, code: string) {
    return this.http
      .put<MusicSessionDto>(this.endpoint + `/${code}`, musicSessionDto)
      .pipe(this.tapCurrentSession);
  }

  public get(code: number) {
    return this.http.get<MusicSessionDto>(this.endpoint + `/${code}`);
  }

  public getAll() {
    return this.http.get<MusicSessionDto[]>(this.endpoint);
  }

  public joinSession(code: number) {
    return this.get(code).pipe(this.tapCurrentSession);
  }

  public deleteSession(code?: number) {
    if (!code) {
      code = this.currentSession()?.code;
    }
    if (code === undefined) return EMPTY;
    return this.http
      .delete<DeletedMusicSessionDto>(this.endpoint + `/${code}`)
      .pipe(
        tap((result) => {
          this.deleteSessionInHistory(result.publicCode);
          this.currentSession.set(null);
        }),
      );
  }

  public exitSession() {
    this.router.navigate(['']);
    this.currentSession.set(null);
  }

  public getSessionHistory(): SessionHistory[] {
    return [];
  }

  public deleteSessionInHistory(code: number) {}

  private tapCurrentSession = tap<MusicSessionDto>((musicSession) => {
    this.currentSession.set(musicSession);
    this.saveSessionInHistory(musicSession);
  });

  private saveSessionInHistory(musicSession: MusicSessionDto) {}
}
