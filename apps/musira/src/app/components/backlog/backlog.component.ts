import { Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import type { FullBacklog } from '../../services/music-api.interface';
import { QueueService } from '../../services/queue.service';
import type { MusicComponentConfiguration } from '../music/music.component';

@Component({
  selector: 'musira-backlog',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss'],
})
export class BacklogComponent {
  backlog: FullBacklog[] | null = null;
  loading = true;
  error = '';

  musicConfig: MusicComponentConfiguration = {
    votable: false,
    deletable: true,
    queueable: false,
    backlog: false,
  };

  constructor(@Inject(QueueService) private readonly queue: QueueService) {
    interval(20000)
      .pipe(
        takeUntilDestroyed(),
        mergeMap(() => this.queue.getFullBacklog()),
      )
      .subscribe({
        next: (backlog) => {
          this.backlog = backlog;
          this.loading = false;
        },
        error: (error) => {
          console.error(error);
          this.loading = false;
          this.error = "Erreur lors de l'obtention de la file d'attente";
        },
      });
  }

  delete(id: number) {
    this.queue
      .deleteBacklog(id)
      .pipe(mergeMap(() => this.queue.getFullBacklog()))
      .subscribe({
        next: (queue) => {
          this.backlog = queue;
        },
      });
  }
}
