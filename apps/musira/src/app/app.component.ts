import { Component, Inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import {
  faGithubSquare,
  faLinkedin,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { UserService } from './user/user.service';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'musira-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  faTwitter = faTwitterSquare;
  faGithub = faGithubSquare;
  faLinkedIn = faLinkedin;
  isDashboard = false;

  constructor(
    @Inject(UserService) private readonly user: UserService,
    @Inject(Router) private readonly router: Router,
    @Inject(DashboardService) private readonly dashboard: DashboardService,
  ) {
    this.dashboard.dashboard$.subscribe({
      next: (value) => {
        this.isDashboard = value;
      },
    });
    effect(() => {
      if (this.user.loggedUser().isLoggedIn !== true) {
        this.router.navigate(['/user/login'], { replaceUrl: true });
      }
    });
  }
}
