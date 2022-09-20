import { Component, OnInit } from '@angular/core';
import { mergeMap, takeUntil, tap } from 'rxjs/operators';
import { Backlog } from '../../services/music-api.interface';
import { QueueService } from '../../services/queue.service';
import { UnsubscribableComponent } from '../../utils/unsubscribable-component';
import { MusicComponentConfiguration } from '../music/music.component';

@Component({
  selector: 'app-backlog',
  templateUrl: './backlog.component.html',
  styleUrls: ['./backlog.component.scss'],
})
export class BacklogComponent
  extends UnsubscribableComponent
  implements OnInit
{
  backlog: Backlog[] | null = null;
  loading = true;
  error = '';

  musicConfig: MusicComponentConfiguration = {
    votable: false,
    deletable: true,
    queueable: false,
    backlog: false,
  };

  constructor(private readonly queue: QueueService) {
    super();
  }

  ngOnInit(): void {
    this.queue
      .getFullBacklog()
      .pipe(
        takeUntil(this.$destroy),
        tap(() => (this.error = ''))
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
