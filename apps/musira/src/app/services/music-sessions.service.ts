import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { UpdateMusicSessionDto } from '@musira/api-interfaces/sessions/update-music-session.dto';

@Injectable({
  providedIn: 'root',
})
export class MusicSessionsService {
  private readonly endpoint = environment.serverUrl + 'music-session';
  constructor(private http: HttpClient) {}

  public create(musicSessionDto: CreateMusicSessionDto) {
    return this.http.post(this.endpoint, musicSessionDto);
  }

  public update(musicSessionDto: UpdateMusicSessionDto, code: string) {
    return this.http.put(this.endpoint + `/${code}`, musicSessionDto);
  }

  public get(code: string) {
    return this.http.get(this.endpoint + `/${code}`);
  }
}
