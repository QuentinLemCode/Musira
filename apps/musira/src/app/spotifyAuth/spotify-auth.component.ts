import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicApiService } from '../services/music-api.service';
import { StorageService } from '../services/storage.service';
import { CONSTANTS } from '../constants';

@Component({
  selector: 'musira-spotify-auth',
  templateUrl: './spotify-auth.component.html',
  styleUrls: ['./spotify-auth.component.scss'],
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
    private readonly music: MusicApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly storage: StorageService,
  ) {}

  ngOnInit(): void {
    const { code, state } = this.spotifyTokens;
    if (!state && !code) {
      this.router.navigate(['']);
    } else if (code && state) {
      this.music.authenticatePlayer(code, state).subscribe({
        next: (status) => {
          if (status.connected) {
            const navigate = [status.sessionHashId];
            const redirect = this.storage.getSessionItem<string>(
              CONSTANTS.SPOTIFY_LOGIN_REDIRECT_SESSION_KEY,
            );
            if (redirect) navigate.push(redirect);
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
