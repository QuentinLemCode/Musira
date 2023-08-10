import { Component, Inject } from '@angular/core';
import { MusicSessionsService } from '../services/music-sessions.service';
import { UserService } from '../user/user.service';

@Component({
  selector: 'musira-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
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
