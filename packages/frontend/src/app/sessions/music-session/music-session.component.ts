import { Component, Inject } from '@angular/core';
import { AuthenticationService } from '../../authentication/authentication.service';
import { MusicSessionsService } from '../music-sessions.service';
import { codeToString } from '../../utils/format-code';

@Component({
  selector: 'musira-music-session',
  templateUrl: './music-session.component.html',
  styleUrls: ['./music-session.component.scss'],
})
export class MusicSessionComponent {
  constructor(
    @Inject(AuthenticationService) private readonly user: AuthenticationService,
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
    return this.sessions.isCreator();
  }
}
