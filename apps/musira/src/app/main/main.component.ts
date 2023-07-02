import { Component } from '@angular/core';
import { MusicSessionsService } from '../services/music-sessions.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'musira-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  constructor(
    private readonly user: UserService,
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
