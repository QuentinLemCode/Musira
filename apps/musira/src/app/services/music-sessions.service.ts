import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { MusicSessionDto } from '@musira/api-interfaces/sessions/music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import { EMPTY, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { CONSTANTS } from '../constants';

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
  public currentSession$ = toObservable(this.currentSession);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private readonly storage: StorageService,
  ) {}

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

  public get(code: string) {
    return this.http.get<MusicSessionDto>(this.endpoint + `/${code}`);
  }

  public joinSession(code: string, navigate_to = true) {
    if (navigate_to) {
      this.router.navigate([code]);
    }
    return this.get(code).pipe(this.tapCurrentSession);
  }

  public deleteSession() {
    const session = this.currentSession();
    if (!session) return EMPTY;
    return this.http.delete(this.endpoint + `/${session.id}`).pipe(
      tap(() => {
        this.deleteSessionInHistory(session);
        this.currentSession.set(null);
      }),
    );
  }

  public exitSession() {
    this.router.navigate(['']);
    this.currentSession.set(null);
  }

  public getSessionHistory() {
    return (
      this.storage
        .getLocalItem<SessionHistory[]>(CONSTANTS.SESSION_HISTORY_KEY)
        ?.reverse() || []
    );
  }

  private tapCurrentSession = tap<MusicSessionDto>((musicSession) => {
    this.currentSession.set(musicSession);
    this.saveSessionInHistory(musicSession);
  });

  private saveSessionInHistory(musicSession: MusicSessionDto) {
    const sessionHistory =
      this.storage.getLocalItem<SessionHistory[]>(
        CONSTANTS.SESSION_HISTORY_KEY,
      ) || [];
    const existingSessionHistory = sessionHistory.find(
      (entry) => entry.musicSession.id === musicSession.id,
    );
    if (existingSessionHistory) {
      existingSessionHistory.access_date = new Date();
    } else {
      sessionHistory.push({
        musicSession,
        access_date: new Date(),
      });
    }

    this.storage.setLocalItem(CONSTANTS.SESSION_HISTORY_KEY, sessionHistory);
  }

  private deleteSessionInHistory(musicSession: MusicSessionDto) {
    const sessionHistory =
      this.storage.getLocalItem<SessionHistory[]>(
        CONSTANTS.SESSION_HISTORY_KEY,
      ) || [];
    const existingSessionHistory = sessionHistory.find(
      (entry) => entry.musicSession.id === musicSession.id,
    );
    if (existingSessionHistory) {
      sessionHistory.splice(sessionHistory.indexOf(existingSessionHistory), 1);
    }

    this.storage.setLocalItem(CONSTANTS.SESSION_HISTORY_KEY, sessionHistory);
  }
}
