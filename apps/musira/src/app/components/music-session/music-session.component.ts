import { Component } from '@angular/core';
import { MusicSessionsService } from '../../services/music-sessions.service';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';

@Component({
  selector: 'musira-music-session',
  templateUrl: './music-session.component.html',
  styleUrls: ['./music-session.component.scss']
})
export class MusicSessionComponent {

  public constructor(private readonly musicSession: MusicSessionsService) {}

  createSession(name: string) {
    this.musicSession.create(new CreateMusicSessionDto(name)).subscribe();
  }

}
