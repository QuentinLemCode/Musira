import { Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs/operators';
import type { Backlog, Music, Queue } from '../../services/music-api.interface';
import { Status } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { UserService } from '../../user/user.service';
import type {
  IconUpdateStatus,
  MusicComponentConfiguration,
} from '../music/music.component';

@Component({
  selector: 'musira-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss'],
})
export class QueueComponent {
  queues: Queue[] | null = null;
  playing: Music | null = null;
  playingUser = '';
  backlog: Backlog | null = null;
  loading = true;
  error = '';
  isEngineStarted = false;

  musicConfig: MusicComponentConfiguration = {
    votable: false,
    deletable: false,
    queueable: false,
    backlog: false,
  };

  getMusicConfig(queue: Queue) {
    const user = this.user.loggedUser();
    const isQueuedByUser =
      user.isLoggedIn && queue.user.id === +(user.userId ?? 0);
    return {
      votable: this.isEngineStarted && user.isLoggedIn,
      deletable: isQueuedByUser || (user.isLoggedIn && user.admin),
      queueable: false,
      backlog: false,
    };
  }

  constructor(
    @Inject(QueueService) private readonly queue: QueueService,
    @Inject(UserService) private readonly user: UserService,
    @Inject(MusicApiService) private readonly music: MusicApiService,
  ) {
    this.queue
      .get()
      .pipe(
        takeUntilDestroyed(),
        tap(() => (this.error = '')),
      )
      .subscribe({
        next: (queue) => {
          this.loadQueue(queue);
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
          this.error = "Erreur lors de l'obtention de la file d'attente";
        },
      });

    this.queue
      .getBacklog()
      .pipe(
        takeUntilDestroyed(),
        tap(() => (this.error = '')),
      )
      .subscribe({
        next: (backlog) => {
          this.backlog = backlog;
        },
      });

    this.music
      .getStatus()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (status) => {
          this.isEngineStarted = status.engineStarted;
          this.playing = status.currentPlay || null;
        },
      });
  }

  delete(id: number, iconUpdate: IconUpdateStatus) {
    iconUpdate.updateLoading(true);
    this.queue.delete(id).subscribe({
      next: () => {
        iconUpdate.updateLoading(false);
        iconUpdate.completeEmitter();
      },
      error: () => {
        iconUpdate.updateLoading(false);
      },
    });
  }

  vote(id: number, iconUpdate: IconUpdateStatus) {
    iconUpdate.updateLoading(true);
    this.queue.forward(id).subscribe({
      next: () => {
        iconUpdate.updateLoading(false);
        iconUpdate.completeEmitter();
      },
      error: (error) => {
        iconUpdate.updateLoading(false);
        if (error?.error?.cause === 'already-voted') {
          this.error = 'Vous avez déjà voté pour cette musique';
          setTimeout(() => (this.error = ''), 5000);
        }
      },
    });
  }

  private loadQueue(queues: Queue[]) {
    const indexPlaying = queues.findIndex((q) => q.status === Status.PLAYING);
    if (indexPlaying !== -1) {
      const [playing] = queues.splice(indexPlaying, 1);
      if (playing) {
        this.playingUser = playing.user.name;
      }
    } else {
      this.playingUser = '';
    }
    this.queues = queues;
  }
}
