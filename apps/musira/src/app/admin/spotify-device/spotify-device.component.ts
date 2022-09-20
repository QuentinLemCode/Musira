import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrentMusic } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';

@Component({
  selector: 'app-spotify-device',
  templateUrl: './spotify-device.component.html',
  styleUrls: ['./spotify-device.component.scss'],
})
export class SpotifyDeviceComponent implements OnInit {
  error = '';
  musicStatus: CurrentMusic | null = null;

  get spotifyTokens() {
    return {
      code: this.route.snapshot.queryParamMap.get('code'),
      state: this.route.snapshot.queryParamMap.get('state'),
    };
  }

  handleError = (err: HttpErrorResponse) => {
    this.error = err?.error?.error || err?.error?.message;
    this.musicStatus = {
      isSpotifyAccountRegistered: err?.error?.isSpotifyAccountRegistered,
      engineStarted: err?.error?.engineStarted,
    };
  };

  constructor(
    private music: MusicApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // TODO Check referrer
    const { code, state } = this.spotifyTokens;
    if (!state && !code) {
      this.music.getStatus().subscribe({
        next: (status) => {
          this.musicStatus = status;
        },
        error: this.handleError,
      });
    } else if (code) {
      this.music.authenticatePlayer(code).subscribe({
        next: (status) => {
          this.musicStatus = status;
          this.router.navigate(['.'], {
            relativeTo: this.route,
            queryParams: {},
          });
        },
        error: this.handleError,
      });
    } else {
      this.error = 'Invalid request';
    }
  }

  login() {
    this.music.getUrlLogin().subscribe({
      next: (url) => {
        window.location.href = url;
      },
    });
  }

  startEngine() {
    this.music.setEngine(true).subscribe({
      next: (status) => {
        this.musicStatus = status;
      },
    });
  }

  stopEngine() {
    this.music.setEngine(false).subscribe({
      next: (status) => {
        this.musicStatus = status;
      },
    });
  }
}
