import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
import type { Backlog, Queue } from '../../services/music-api.interface';
import { Status } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { UserService } from '../../services/user.service';
import { UnsubscribableComponent } from '../../utils/unsubscribable-component';
import type {
  IconUpdateStatus,
  MusicComponentConfiguration,
} from '../music/music.component';

@Component({
  selector: 'musira-queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.scss'],
})
export class QueueComponent extends UnsubscribableComponent implements OnInit {
  queues: Queue[] | null = null;
  playing: Queue | null = null;
  backlog: Backlog | null = null;
  loading = true;
  error = '';
  isEngineStarted = false;

  musicConfig: MusicComponentConfiguration = {
    votable: false,
    deletable: this.user.isAdmin(),
    queueable: false,
    backlog: false,
  };

  getMusicConfig(queue: Queue) {
    const isQueuedByUser =
      this.user.isLoggedIn && queue.user.id === +(this.user.userId ?? 0);
    return {
      votable: this.isEngineStarted && this.user.isLoggedIn,
      deletable: isQueuedByUser || this.user.isAdmin(),
      queueable: false,
      backlog: false,
    };
  }

  constructor(
    @Inject(QueueService) private readonly queue: QueueService,
    @Inject(UserService) private readonly user: UserService,
    @Inject(MusicApiService) private readonly music: MusicApiService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.queue
      .get()
      .pipe(
        takeUntil(this.$destroy),
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
        takeUntil(this.$destroy),
        tap(() => (this.error = '')),
      )
      .subscribe({
        next: (backlog) => {
          this.backlog = backlog;
        },
      });

    this.music
      .getStatus()
      .pipe(takeUntil(this.$destroy))
      .subscribe({
        next: (status) => {
          this.isEngineStarted = status.engineStarted;
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
        this.playing = playing;
      }
    }
    this.queues = queues;
  }
}
