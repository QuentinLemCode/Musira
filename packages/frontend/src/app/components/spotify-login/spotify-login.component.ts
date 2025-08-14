import { CommonModule } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MusicApiService } from '../../services/music-api.service';

@Component({
  selector: 'musira-spotify-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  template: `
    @if (format === 'Button') {
      <button [disabled]="disabled" (click)="login()">
        {{ text }}
      </button>
    } @else if (format === 'Link') {
      <a (click)="login()">{{ text }}</a>
    }
  `,
  styles: [``],
})
export class SpotifyLoginComponent {
  @Input() disabled = false;
  @Input() beforeLoginHandler: () => Promise<void> = async () => void 0;
  @Input() redirect_to = '';
  @Input() format: 'Button' | 'Link' = 'Button';
  @Input() text = 'Login with Spotify';

  constructor(
    @Inject(MusicApiService) private readonly music: MusicApiService,
  ) {}

  async login() {
    if (this.disabled) return;
    await this.beforeLoginHandler();
    // this.storage.setSessionItem(
    //   CONSTANTS.SPOTIFY_LOGIN_REDIRECT_SESSION_KEY,
    //   this.redirect_to,
    // );
    this.music.getUrlLogin().subscribe({
      next: (url) => {
        window.location.href = url;
      },
    });
  }
}
