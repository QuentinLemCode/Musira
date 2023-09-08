import type { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import type { CurrentMusic } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { SettingsService } from '../../services/settings.service';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-session-settings',
  templateUrl: './session-settings.component.html',
  styleUrls: ['./session-settings.component.scss'],
})
export class SessionSettingsComponent {
  maxVote: number | undefined;
  maxQueuableSongs: number | undefined;
  faArrowRotateLeft = faArrowRotateLeft;
  error = '';
  musicStatus: CurrentMusic | null = null;

  maxVotesSaveStatus = '';
  maxQueuableSongsSaveStatus = '';

  constructor(
    @Inject(SettingsService) private readonly settings: SettingsService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
    @Inject(MusicApiService) private readonly music: MusicApiService,
    @Inject(Router) private readonly router: Router,
  ) {
    this.music
      .getStatus()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (status) => {
          this.musicStatus = status;
        },
        error: this.handleError,
      });

    this.settings
      .get()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (setting) => {
          this.maxVote = setting.maxVotes;
          this.maxQueuableSongs = setting.maxQueuableSongPerUser;
        },
      });
  }

  handleError = (err: HttpErrorResponse) => {
    this.error = err?.error?.error || err?.error?.message;
    this.musicStatus = {
      isSpotifyAccountRegistered: err?.error?.isSpotifyAccountRegistered,
      engineStarted: err?.error?.engineStarted,
    };
  };

  setMaxVotes() {
    if (!this.maxVote) return;
    this.settings.setMaxVote(this.maxVote).subscribe({
      next: (vote) => {
        this.maxVote = vote.maxVotes;
        this.setMaxVotesSaveStatus('Sauvegardé avec succès !');
      },
      error: (err) => {
        console.error(err);
        this.setMaxVotesSaveStatus('Erreur lors de la sauvegarde');
      },
    });
  }

  setMaxQueuableSongs() {
    if (!this.maxQueuableSongs) return;
    this.settings.setMaxQueuableSongPerUser(this.maxQueuableSongs).subscribe({
      next: (vote) => {
        this.maxQueuableSongs = vote.maxQueuableSongPerUser;
        this.setMaxQueuableSongsSaveStatus('Sauvegardé avec succès !');
      },
      error: (err) => {
        console.error(err);
        this.setMaxQueuableSongsSaveStatus('Erreur lors de la sauvegarde');
      },
    });
  }

  deleteSession() {
    this.sessions.deleteSession().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
    });
  }

  logoutPlayer(): void {
    this.music.logoutPlayer().subscribe();
  }

  private setMaxVotesSaveStatus(status: string) {
    this.maxVotesSaveStatus = status;
    setTimeout(() => {
      this.maxVotesSaveStatus = '';
    }, 3000);
  }

  private setMaxQueuableSongsSaveStatus(status: string) {
    this.maxQueuableSongsSaveStatus = status;
    setTimeout(() => {
      this.maxQueuableSongsSaveStatus = '';
    }, 3000);
  }
}
