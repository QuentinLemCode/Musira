import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MusicApiService } from '../services/music-api.service';

@Component({
  selector: 'musira-spotify-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  template: ` <p>{{ error }}</p> `,
  styles: [``],
})
export class SpotifyAuthComponent implements OnInit {
  error = '';
  get spotifyTokens() {
    return {
      code: this.route.snapshot.queryParamMap.get('code'),
      state: this.route.snapshot.queryParamMap.get('state'),
    };
  }

  constructor(
    @Inject(MusicApiService) private readonly music: MusicApiService,
    @Inject(ActivatedRoute) private readonly route: ActivatedRoute,
    @Inject(Router) private readonly router: Router,
  ) {}

  ngOnInit(): void {
    const { code, state } = this.spotifyTokens;
    if (!state && !code) {
      this.router.navigate(['']);
    } else if (code && state) {
      this.music.authenticatePlayer(code, state).subscribe({
        next: (status) => {
          if (status.connected) {
            const navigate = [status.publicCode];
            // const redirect = this.storage.getSessionItem<string>(
            //   CONSTANTS.SPOTIFY_LOGIN_REDIRECT_SESSION_KEY,
            // );
            // if (redirect) navigate.push(redirect);
            this.router.navigate(navigate, {
              relativeTo: null,
              queryParams: {},
            });
          }
        },
        error: (err) => {
          this.error = err?.error?.error || err?.error?.message;
        },
      });
    } else {
      this.error = 'Invalid request';
    }
  }
}
