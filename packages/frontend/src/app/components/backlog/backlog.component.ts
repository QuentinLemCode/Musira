import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { FullBacklogDtoDto } from '@musira/client';
import { interval, type Observer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { QueueService } from '../../services/queue.service';
import type { MusicComponentConfiguration } from '../music/music.component';
import { MusicComponent } from '../music/music.component';

@Component({
  selector: 'musira-backlog',
  standalone: true,
  imports: [CommonModule, MusicComponent],
  template: `
    @if (loading) {
      <p>Chargement ...</p>
    }
    @if (error) {
      <p>{{ error }}</p>
    }

    @if (backlog !== null) {
      @for (item of backlog; track item.id) {
        <musira-music
          [music]="item.music"
          [config]="musicConfig"
          (delete)="delete(item.id)"
          [message]="'Joué ' + item.play_count + ' fois'"
        ></musira-music>
      }
    }
  `,
  styles: [``],
})
export class BacklogComponent {
  backlog: FullBacklogDtoDto[] | null = null;
  loading = true;
  error = '';

  musicConfig: MusicComponentConfiguration = {
    votable: false,
    deletable: true,
    queueable: false,
    backlog: false,
  };

  constructor(@Inject(QueueService) private readonly queue: QueueService) {
    const subsribeParam: Partial<Observer<FullBacklogDtoDto[]>> = {
      next: (backlog) => {
        this.backlog = backlog;
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
        this.error = "Erreur lors de l'obtention de la file d'attente";
      },
    };
    this.queue.getFullBacklog().subscribe(subsribeParam);
    interval(4000)
      .pipe(
        takeUntilDestroyed(),
        mergeMap(() => this.queue.getFullBacklog()),
      )
      .subscribe(subsribeParam);
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
