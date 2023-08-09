import { Component, Inject } from '@angular/core';
import { MusicSessionsService } from '../../services/music-sessions.service';

@Component({
  selector: 'musira-music-session',
  templateUrl: './music-session.component.html',
  styleUrls: ['./music-session.component.scss'],
})
export class MusicSessionComponent {
  public constructor(
    @Inject(MusicSessionsService)
    private readonly musicSessions: MusicSessionsService,
  ) {}

  joinSession(code: string) {
    this.musicSessions.joinSession(code).subscribe();
  }

  get sessionHistory() {
    return this.musicSessions.getSessionHistory();
  }
}
