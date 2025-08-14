import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, computed, inject, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MusicSessionsService as ApiSessionsService } from '@musira/client';
import { EMPTY, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthenticationService,
  type UserState,
} from '../authentication/authentication.service';
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

  private readonly history = signal<SessionHistory[]>([]);

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

    // Clear session history on logout
    toObservable(inject(AuthenticationService).loggedUser).subscribe({
      next: (user: UserState) => {
        if (user.isLoggedIn === false) {
          this.history.set([]);
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
        tap(() => {
          this.currentSession.set(null);
          this.refreshSessionHistory();
        }),
      );
  }

  public exitSession() {
    this.router.navigate(['']);
    this.currentSession.set(null);
  }

  public getSessionHistory(): SessionHistory[] {
    return this.history();
  }

  public refreshSessionHistory() {
    this.http
      .get<
        { access_date: string; musicSession: MusicSessionDto }[]
      >(this.endpoint + '/history/me')
      .subscribe({
        next: (entries) => {
          this.history.set(
            entries.map((e) => ({
              musicSession: e.musicSession,
              access_date: new Date(e.access_date),
            })),
          );
        },
        error: () => {
          this.history.set([]);
        },
      });
  }

  private tapCurrentSession = tap<MusicSessionDto>((musicSession) => {
    this.currentSession.set(musicSession);
    this.refreshSessionHistory();
  });
}
