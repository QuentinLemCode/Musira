import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';
import { MusicSessionDto } from '@musira/api-interfaces/sessions/music-session.dto';
import { Subject, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class MusicSessionsService {
  private readonly endpoint = environment.serverUrl + 'music-session';

  private readonly subject = new Subject<MusicSessionDto | null>();
  public readonly currentSession$ = this.subject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {}

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
    return this.http
      .get<MusicSessionDto>(this.endpoint + `/${code}`)
      .pipe(this.tapCurrentSession);
  }

  public exitSession() {
    this.router.navigate(['']);
    this.subject.next(null);
  }

  private tapCurrentSession = tap<MusicSessionDto>((musicSession) => {
    this.subject.next(musicSession);
  });
}
