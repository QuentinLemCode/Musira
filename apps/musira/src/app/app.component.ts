import { Component, Inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import {
  faGithubSquare,
  faLinkedin,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { UserService } from './user/user.service';
import { DashboardService } from './services/dashboard.service';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../../auth.config';

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
    @Inject(OAuthService) private readonly oauthService: OAuthService,
  ) {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocument();
    this.oauthService.tryLogin({
      onTokenReceived: (context) => {
        //
        // Output just for purpose of demonstration
        // Don't try this at home ... ;-)
        //
        console.debug('logged in');
        console.debug(context);
      },
    });
    this.oauthService.setupAutomaticSilentRefresh();

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
