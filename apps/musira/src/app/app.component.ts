import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  faGithubSquare,
  faLinkedin,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { UserService } from './user/user.service';
import { MusicSessionsService } from './services/music-sessions.service';

@Component({
  selector: 'musira-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  faTwitter = faTwitterSquare;
  faGithub = faGithubSquare;
  faLinkedIn = faLinkedin;

  constructor(
    @Inject(UserService) private readonly user: UserService,
    @Inject(Router) private readonly router: Router,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
  ) {}

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

  async logout() {
    await this.user.logout();
    console.log('ok');
    this.router.navigate(['/login'], { replaceUrl: true });
  }
}
