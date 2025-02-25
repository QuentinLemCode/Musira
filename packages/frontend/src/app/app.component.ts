import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGithubSquare,
  faLinkedin,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { NavigationModule } from './navigation/navigation.module';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [FontAwesomeModule, RouterModule, NavigationModule],
  providers: [DashboardService],
  standalone: true,
})
export class AppComponent {
  faTwitter = faTwitterSquare;
  faGithub = faGithubSquare;
  faLinkedIn = faLinkedin;
  isDashboard = false;

  private readonly dashboard = inject(DashboardService);

  constructor() {
    this.dashboard.dashboard$.subscribe({
      next: (value) => {
        this.isDashboard = value;
      },
    });
  }
}
