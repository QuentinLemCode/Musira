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

  public update(musicSessionDto: UpdateMusicSessionDto, id: number) {
    return this.http.put(this.endpoint + `/${id}`, musicSessionDto);
  }

  public get(id: number) {
    return this.http.get(this.endpoint + `/${id}`);
  }
}
