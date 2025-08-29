import { Component, inject } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faGithubSquare,
  faLinkedin,
  faTwitterSquare,
} from '@fortawesome/free-brands-svg-icons';
import { AuthModalComponent } from './authentication/auth-modal.component';
import { NavigationComponent } from './navigation/navigation.component';
import { DashboardService } from './services/dashboard.service';

@Component({
  selector: 'app-root',
  template: `
    @if (!isDashboard) {
      <header>
        <musira-navigation></musira-navigation>
      </header>
    }
    <router-outlet></router-outlet>
    <musira-auth-modal></musira-auth-modal>
    @if (!isDashboard) {
      <footer>
        <p>
          Développé avec ❤️ par QuentinLemCode
          <a class="icon-link" href="https://twitter.com/QuentinLemCode"
            ><fa-icon [icon]="faTwitter"></fa-icon
          ></a>
          <a class="icon-link" href="https://github.com/QuentinLemCode">
            <fa-icon [icon]="faGithub"></fa-icon>
          </a>
          <br />
          Un très grand merci à Théo Charlot pour le design ✏️
          <br />
        </p>
      </footer>
    }
  `,
  styles: [
    `
      footer {
        text-align: center;
        font-size: 12px;
        margin-top: 50px;
        a.icon-link {
          font-size: 20px;
          margin-left: 8px;
        }
      }
    `,
  ],
  imports: [
    FontAwesomeModule,
    RouterOutlet,
    RouterModule,
    NavigationComponent,
    AuthModalComponent,
  ],
  providers: [DashboardService],
  standalone: true,
})
export class App {
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
