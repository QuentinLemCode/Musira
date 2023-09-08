import { Component, Inject } from '@angular/core';
import { UserService } from '../../user/user.service';
import { MusicSessionsService } from '../music-sessions.service';
import { codeToString } from '../../utils/format-code';

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

  get currentSession() {
    return this.sessions.currentSession();
  }

  get formattedSessionCode() {
    return codeToString(this.currentSession?.code || 0);
  }

  get isLoggedIn() {
    return this.user.loggedUser().isLoggedIn;
  }

  get isCreator() {
    return this.user.isSessionCreator(this.currentSession?.code || 0);
  }
}
