import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MusicApiService } from '../services/music-api.service';

@Component({
  selector: 'musira-spotify-auth',
  templateUrl: './spotify-auth.component.html',
  styleUrls: ['./spotify-auth.component.scss'],
})
export class SpotifyAuthComponent implements OnInit {
  error = ''
  get spotifyTokens() {
    return {
      code: this.route.snapshot.queryParamMap.get('code'),
      state: this.route.snapshot.queryParamMap.get('state'),
    };
  }

  constructor(
    private music: MusicApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const { code, state } = this.spotifyTokens;
    if (!state && !code) {
      this.router.navigate([''])
    } else if (code && state) {
      this.music.authenticatePlayer(code, state).subscribe({
        next: (status) => {
          if (status.connected) {
            this.router.navigate([status.sessionHashId, 'session-settings'], {
              relativeTo: null,
              queryParams: {},
            });
          }
        },
        error: (err) => {this.error = err?.error?.error || err?.error?.message},
      });
    } else {
      this.error = 'Invalid request';
    }
  }
}
