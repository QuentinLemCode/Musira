import { CommonModule } from '@angular/common';
import { Component, Inject, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type {
  CurrentMusic,
  FullBacklog,
} from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';
import { SpotifyLoginComponent } from '../spotify-login/spotify-login.component';

@Component({
  selector: 'musira-spotify-status',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SpotifyLoginComponent,
  ],
  template: `
    <ul *ngIf="musicStatus !== undefined; else loading">
      <li *ngIf="musicStatus.isSpotifyAccountRegistered">
        ✅ Connecté à Spotify
      </li>
      <li *ngIf="!musicStatus.isSpotifyAccountRegistered">
        ❌ Non connecté à Spotify
        <ul>
          <li>
            <musira-spotify-login
              [format]="'Link'"
              [text]="'Se connecter'"
            ></musira-spotify-login>
          </li>
        </ul>
      </li>
      <li
        class="cursor-pointer"
        *ngIf="musicStatus.engineStarted"
        (click)="collapsed = !collapsed"
      >
        ✅ <span class="underline">Gestion de la playlist</span>
        <div *ngIf="collapsed" class="ml-4 mt-2 mb-2 text-xl">
          <a (click)="stopEngine()">Arrêter la gestion de la playlist</a>
        </div>
      </li>
      <li
        class="cursor-pointer"
        *ngIf="!musicStatus.engineStarted"
        (click)="collapsed = !collapsed"
      >
        ❌ <span class="underline">Gestion de la playlist arrếté</span>
        <div class="ml-4 mt-2 mb-2 text-xl">
          <a *ngIf="!isQueueEmpty; else addSongMessage" (click)="startEngine()"
            >Lancer la gestion de la playlist</a
          >
        </div>
      </li>
      <li *ngIf="backlog && backlog.length > 0">
        ✅ Titres présent en réserve
      </li>
      <li *ngIf="!backlog || backlog.length === 0">
        ❌ Ancun titre en réserve
        <div class="ml-4">
          <a
            [routerLink]="['/', currentSessionCode, 'session-settings']"
            fragment="backlog"
            class="ml-4 mt-2 mb-2 text-xl"
            >Ajouter des titres à la réserve</a
          >
        </div>
      </li>
    </ul>
    <p *ngIf="error">{{ error }}</p>

    <ng-template #loading> Chargement </ng-template>
    <ng-template #addSongMessage>
      Ajouter des titres en files d'attente avant de lancer la gestion de
      playlist
    </ng-template>
  `,
  styles: [``],
})
export class SpotifyStatusComponent {
  constructor(
    @Inject(MusicApiService) private readonly music: MusicApiService,
    @Inject(QueueService) private readonly queue: QueueService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
  ) {
    this.music
      .getStatus()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (status) => (this.musicStatus = status),
      });

    this.queue
      .get()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (queue) => {
          this.isQueueEmpty = queue.length === 0;
        },
      });

    // TODO : make it dynamic
    this.queue.getFullBacklog().subscribe({
      next: (backlog) => (this.backlog = backlog),
    });

    effect(() => {
      this.currentSessionCode = this.sessions.currentSession()?.code;
    });
  }

  isQueueEmpty = false;
  currentSessionCode: number | undefined;
  collapsed = false;
  musicStatus: CurrentMusic | undefined;
  backlog: FullBacklog[] | undefined;
  error = '';

  startEngine() {
    this.music.startEngine().subscribe({
      next: (status) => {
        this.musicStatus = status;
        this.collapsed = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Erreur lors du démarrage. Essayez de rafraîchir la page';
      },
    });
  }

  stopEngine() {
    this.music.stopEngine().subscribe({
      next: (status) => (this.musicStatus = status),
      error: (err) => {
        console.error(err);
        this.error = "Erreur lors de l'arrêt. Essayez de rafraîchir la page.";
      },
    });
  }
}
