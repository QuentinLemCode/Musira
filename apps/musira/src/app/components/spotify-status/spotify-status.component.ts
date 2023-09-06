import { Component, Inject, effect } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Backlog, CurrentMusic } from '../../services/music-api.interface';
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
      .getBacklog()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (backlog) => (this.backlog = backlog),
      });

    effect(() => {
      this.currentSessionCode = this.sessions.currentSession()?.code;
    });
  }

  currentSessionCode: number | undefined;
  collapsed = false;
  musicStatus: CurrentMusic | undefined;
  backlog: Backlog | undefined | null;

  startEngine() {
    this.music.startEngine().subscribe();
  }

  stopEngine() {
    this.music.stopEngine().subscribe();
  }
}
