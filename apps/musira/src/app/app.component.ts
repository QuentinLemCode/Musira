import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  faGithubSquare,
  faLinkedin,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { UserService } from './user/user.service';
import { MusicSessionsService } from './sessions/music-sessions.service';

@Component({
  selector: 'musira-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  faTwitter = faTwitterSquare;
  faGithub = faGithubSquare;
  faLinkedIn = faLinkedin;

  constructor(
    @Inject(UserService) private readonly user: UserService,
    @Inject(Router) private readonly router: Router,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
  ) {}

  ngOnInit() {
    const isLoggedIn = this.user.refreshTokenIfExpired();
    if (!isLoggedIn) {
      this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  get currentSession() {
    return this.session.currentSession();
  }

  get isLoggedIn() {
    return this.user.isLoggedIn;
  }

  get username() {
    return this.user.username;
  }

  get isAdmin() {
    return this.user.isAdmin();
  }
}
