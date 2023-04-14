import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateMusicSessionDto } from '@musira/api-interfaces/dto/sessions/create-music-session.dto';

@Injectable({
  providedIn: 'root'
})
export class MusicSessionsService {

  private readonly endpoint = environment.serverUrl + 'music-sessions';
  constructor(private http: HttpClient) { }

  public create(musicSessionDto: CreateMusicSessionDto) {
    return this.http.post(this.endpoint, musicSessionDto);
  }
}
