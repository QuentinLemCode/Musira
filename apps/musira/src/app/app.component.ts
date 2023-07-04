import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  faGithubSquare,
  faLinkedin,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { UserService } from './services/user.service';
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
    private user: UserService,
    private router: Router,
    private session: MusicSessionsService,
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

  logout() {
    this.user.logout().subscribe({
      next: () => {
        this.router.navigate(['/login'], { replaceUrl: true });
      },
    });
  }
}
