import type { HttpErrorResponse } from '@angular/common/http';
import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import type { CurrentMusic } from '../../../services/music-api.interface';
import { MusicApiService } from '../../../services/music-api.service';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'musira-spotify-device',
  templateUrl: './spotify-device.component.html',
  styleUrls: ['./spotify-device.component.scss'],
})
export class SpotifyDeviceComponent implements OnInit {
  error = '';
  musicStatus: CurrentMusic | null = null;
  faArrowRotateLeft = faArrowRotateLeft;

  constructor(
    @Inject(MusicApiService) private readonly music: MusicApiService,
    @Inject(Router) private readonly router: Router,
    @Inject(ActivatedRoute) private readonly route: ActivatedRoute,
  ) {}

  back() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  handleError = (err: HttpErrorResponse) => {
    this.error = err?.error?.error || err?.error?.message;
    this.musicStatus = {
      isSpotifyAccountRegistered: err?.error?.isSpotifyAccountRegistered,
      engineStarted: err?.error?.engineStarted,
    };
  };

  ngOnInit(): void {
    this.music.getStatus().subscribe({
      next: (status) => {
        this.musicStatus = status;
      },
      error: this.handleError,
    });
  }

  logoutPlayer(): void {
    this.music.logoutPlayer().subscribe();
  }
}
