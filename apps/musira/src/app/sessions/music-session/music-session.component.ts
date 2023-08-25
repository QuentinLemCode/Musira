import { Component, Inject } from '@angular/core';
import { UserService } from '../../user/user.service';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-music-session',
  templateUrl: './music-session.component.html',
  styleUrls: ['./music-session.component.scss'],
})
export class MusicSessionComponent {
  constructor(
    @Inject(UserService) private readonly user: UserService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
  ) {}

  exitSession() {
    this.sessions.exitSession();
  }

  get currentSession() {
    return this.sessions.currentSession();
  }

  get isLoggedIn() {
    return this.user.isLoggedIn;
  }
}
