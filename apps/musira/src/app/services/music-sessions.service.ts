import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { MusicSessionDto } from '@musira/api-interfaces/sessions/music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

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
  ) {
  }

  public create(musicSessionDto: CreateMusicSessionDto) {
    return this.http.post<MusicSessionDto>(this.endpoint, musicSessionDto).pipe(
      this.tapCurrentSession,
      tap((session) => {
        this.router.navigate([session.id]);
      }),
    );
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

  public exitSession() {
    this.router.navigate(['']);
    this.currentSession.set(null);
  }

  private tapCurrentSession = tap<MusicSessionDto>((musicSession) => {
    this.currentSession.set(musicSession);
  });
}
