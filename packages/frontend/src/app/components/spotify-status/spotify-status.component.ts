import { CommonModule } from '@angular/common';
import { Component, Inject, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { CurrentMusicDto, FullBacklogDto } from '@musira/client';
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
    @if (musicStatus !== undefined) {
      <ul>
        @if (musicStatus.isSpotifyAccountRegistered) {
          <li>✅ Connecté à Spotify</li>
        }
        @if (!musicStatus.isSpotifyAccountRegistered) {
          <li>
            ❌ Non connecté à Spotify
            @if (musicStatus.message) {
              <div class="text-sm text-gray-500 mt-1">
                {{ musicStatus.message }}
              </div>
            }
            <ul>
              <li>
                <musira-spotify-login
                  [format]="'Link'"
                  [text]="'Se connecter'"
                ></musira-spotify-login>
              </li>
            </ul>
          </li>
        }
        @if (musicStatus.engineStarted) {
          <li class="cursor-pointer" (click)="collapsed = !collapsed">
            ✅ <span class="underline">Gestion de la playlist</span>
            @if (collapsed) {
              <div class="ml-4 mt-2 mb-2 text-xl">
                <a (click)="stopEngine()">Arrêter la gestion de la playlist</a>
              </div>
            }
          </li>
        }
        @if (!musicStatus.engineStarted) {
          <li class="cursor-pointer" (click)="collapsed = !collapsed">
            ❌ <span class="underline">Gestion de la playlist arrếté</span>
            <div class="ml-4 mt-2 mb-2 text-xl">
              @if (!isQueueEmpty) {
                <a (click)="startEngine()">Lancer la gestion de la playlist</a>
              } @else {
                Ajouter des titres en files d'attente avant de lancer la gestion
                de playlist
              }
            </div>
          </li>
        }
        @if (backlog && backlog.length > 0) {
          <li>✅ Titres présent en réserve</li>
        }
        @if (!backlog || backlog.length === 0) {
          <li>
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
        }
      </ul>
    } @else {
      Chargement
    }
    @if (error) {
      <p>{{ error }}</p>
    }
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
  musicStatus: CurrentMusicDto | undefined;
  backlog: FullBacklogDto[] | undefined;
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
