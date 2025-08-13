import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MusicSessionsService as ApiSessionsService } from '@musira/client';
import { EMPTY, tap } from 'rxjs';
import { environment } from '../../environments/environment';
type CreateMusicSessionDto = { name: string };
type DeletedMusicSessionDto = { publicCode: number };
type MusicSessionDto = {
  id: number;
  name: string;
  code: number;
  creator: string;
  linkedToSpotify: boolean;
  isCreator: boolean;
};
type UpdateMusicSessionDto = { name?: string };

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
    @Inject(ApiSessionsService) private readonly api: ApiSessionsService,
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
    try {
      const raw = localStorage.getItem('session_history');
      if (!raw) return [];
      const parsed = JSON.parse(raw) as SessionHistory[];
      return parsed.map((h) => ({
        musicSession: h.musicSession,
        access_date: new Date(h.access_date),
      }));
    } catch {
      return [];
    }
  }

  public deleteSessionInHistory(code: number) {
    try {
      const history = this.getSessionHistory().filter(
        (h) => h.musicSession.code !== code,
      );
      localStorage.setItem('session_history', JSON.stringify(history));
    } catch {
      // noop
    }
  }

  private tapCurrentSession = tap<MusicSessionDto>((musicSession) => {
    this.currentSession.set(musicSession);
    this.saveSessionInHistory(musicSession);
  });

  private saveSessionInHistory(musicSession: MusicSessionDto) {
    try {
      const history = this.getSessionHistory();
      const withoutDup = history.filter(
        (h) => h.musicSession.code !== musicSession.code,
      );
      const newEntry: SessionHistory = {
        musicSession,
        access_date: new Date(),
      };
      const updated = [newEntry, ...withoutDup].slice(0, 10);
      localStorage.setItem('session_history', JSON.stringify(updated));
    } catch {
      // noop
    }
  }
}
