import { CommonModule } from '@angular/common';
import type { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRotateLeft } from '@fortawesome/free-solid-svg-icons';
import { BacklogComponent } from '../../components/backlog/backlog.component';
import { MusicComponent } from '../../components/music/music.component';
import { SearchComponent } from '../../components/search/search.component';
import { SpotifyLoginComponent } from '../../components/spotify-login/spotify-login.component';
import { SpotifyStatusComponent } from '../../components/spotify-status/spotify-status.component';
import type { CurrentMusic } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { SettingsService } from '../../services/settings.service';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-session-settings',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SpotifyStatusComponent,
    MusicComponent,
    SearchComponent,
    SpotifyLoginComponent,
    BacklogComponent,
  ],
  template: `
    <div class="mb-8 mt-4">
      <a class="text-xl text-right" [routerLink]="'..'"
        ><fa-icon [icon]="faArrowRotateLeft"></fa-icon> Retourner sur la
        session</a
      >
    </div>

    <h1>Status de votre session Spotify</h1>
    <musira-spotify-status></musira-spotify-status>

    <p *ngIf="error" class="error">{{ error }}</p>

    <div *ngIf="musicStatus; else loading" class="mt-4">
      <p *ngIf="musicStatus.message">{{ musicStatus.message }}</p>
      <h2 *ngIf="musicStatus.currentPlay">
        Musique en cours de lecture sur Spotify :
      </h2>
      <musira-music
        *ngIf="musicStatus.currentPlay"
        [music]="musicStatus.currentPlay"
      ></musira-music>

      <h1 id="backlog">Réserve de titres :</h1>
      <p>
        Lorsqu'il n'y a plus de musique dans la playlist, un titre au hasard
        passera depuis cette réserve.
      </p>
      <musira-search [forBacklog]="true"></musira-search>
      <musira-backlog></musira-backlog>
    </div>

    <ng-template #notAuthenticated>
      <musira-spotify-login
        [redirect_to]="'session-settings'"
      ></musira-spotify-login>
    </ng-template>

    <ng-template #loading>
      <p>Chargement...</p>
    </ng-template>

    <h1 class="mt-8">Paramètres</h1>
    <div
      *ngIf="maxVote !== undefined"
      class="flex flex-row flex-nowrap justify-evenly items-baseline mb-2"
    >
      <label for="maxVotes">Nombre de votes pour passer une musique :</label>
      <input class="w-24" type="number" name="maxVotes" [(ngModel)]="maxVote" />
      <button (click)="setMaxVotes()">Sauvegarder</button>
    </div>
    <p *ngIf="maxVotesSaveStatus" class="text-center">
      {{ maxVotesSaveStatus }}
    </p>

    <div
      *ngIf="maxQueuableSongs !== undefined"
      class="flex flex-row flex-nowrap justify-evenly items-baseline"
    >
      <label for="maxSongs">Nombre maximum de musique par utilisateur :</label>
      <input
        class="w-24"
        type="number"
        name="maxSongs"
        [(ngModel)]="maxQueuableSongs"
      />
      <button (click)="setMaxQueuableSongs()">Sauvegarder</button>
    </div>
    <p *ngIf="maxQueuableSongsSaveStatus" class="text-center">
      {{ maxQueuableSongsSaveStatus }}
    </p>

    <div class="mt-8">
      <h1>Zone dangereuse</h1>
      <button (click)="deleteSession()">Supprimer la session</button>
      <button
        class="ml-4"
        *ngIf="musicStatus?.isSpotifyAccountRegistered"
        (click)="logoutPlayer()"
      >
        Déconnecter de Spotify
      </button>
    </div>
  `,
  styles: [``],
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

    (this.settings.get() as any).subscribe({
      next: (setting: any) => {
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
    (this.settings.setMaxVote(this.maxVote) as any).subscribe({
      next: (vote: any) => {
        this.maxVote = vote.maxVotes;
        this.setMaxVotesSaveStatus('Sauvegardé avec succès !');
      },
      error: (err: any) => {
        console.error(err);
        this.setMaxVotesSaveStatus('Erreur lors de la sauvegarde');
      },
    });
  }

  setMaxQueuableSongs() {
    if (!this.maxQueuableSongs) return;
    (
      this.settings.setMaxQueuableSongPerUser(this.maxQueuableSongs) as any
    ).subscribe({
      next: (vote: any) => {
        this.maxQueuableSongs = vote.maxQueuableSongPerUser;
        this.setMaxQueuableSongsSaveStatus('Sauvegardé avec succès !');
      },
      error: (err: any) => {
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
