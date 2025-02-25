import { Component, Inject, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type {
  CurrentMusic,
  FullBacklog,
} from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';

@Component({
  selector: 'musira-spotify-status',
  templateUrl: './spotify-status.component.html',
  styleUrls: ['./spotify-status.component.scss'],
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
