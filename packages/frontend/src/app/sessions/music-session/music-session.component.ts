import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthenticationService } from '../../authentication/authentication.service';
import { QueueComponent } from '../../components/queue/queue.component';
import { SearchComponent } from '../../components/search/search.component';
import { SpotifyStatusComponent } from '../../components/spotify-status/spotify-status.component';
import { codeToString } from '../../utils/format-code';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-music-session',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    QueueComponent,
    SpotifyStatusComponent,
    SearchComponent,
  ],
  template: `
    <h1>🎉 {{ currentSession?.name }}</h1>
    <h3 class="text-lg">Oranisé par {{ currentSession?.creator }}</h3>
    <h4 class="italic text-right">#{{ formattedSessionCode }}</h4>

    @if (isCreator) {
      <musira-spotify-status></musira-spotify-status>
    }

    @if (isLoggedIn) {
      <musira-search></musira-search>
    } @else {
      <a [routerLink]="['/user/login']">
        Connecte-toi pour ajouter des musiques
      </a>
    }
    <musira-queue></musira-queue>
  `,
  styles: [``],
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
