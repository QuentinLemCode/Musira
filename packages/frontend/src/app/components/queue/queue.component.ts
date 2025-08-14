import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import type { BacklogDtoDto, MusicDtoDto, QueueDtoDto } from '@musira/client';
import { QueueDtoDto as QueueDtoType } from '@musira/client';
import { tap } from 'rxjs/operators';
import { AuthenticationService } from '../../authentication/authentication.service';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import type {
  IconUpdateStatus,
  MusicComponentConfiguration,
} from '../music/music.component';
import { MusicComponent } from '../music/music.component';

@Component({
  selector: 'musira-queue',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MusicComponent,
  ],
  template: `
    @if (loading) {
      <p>Chargement ...</p>
    }
    @if (error) {
      <p>{{ error }}</p>
    }

    @if (queues !== null) {
      @if (playing) {
        <h3>En cours de lecture</h3>
        <musira-music [music]="playing" [username]="playingUser"></musira-music>
        <hr />
      }
      <h3>File d'attente</h3>
      @for (queue of queues!; track queue.id) {
        <musira-music
          [music]="queue.music"
          [username]="queue.user.name"
          [config]="getMusicConfig(queue)"
          (delete)="delete(queue.id, $event)"
          (vote)="vote(queue.id, $event)"
          [voteCount]="queue.forward_votes"
        ></musira-music>
      }
      @if (backlog) {
        <musira-music [music]="backlog.music" [backlog]="true"></musira-music>
      }
    }
  `,
  styles: [
    `
      app-music {
        margin-bottom: 10px;
      }
    `,
  ],
})
export class QueueComponent {
  queues: QueueDtoDto[] | null = null;
  playing: MusicDtoDto | null = null;
  playingUser = '';
  backlog: BacklogDtoDto | null = null;
  loading = true;
  error = '';
  isEngineStarted = false;

  musicConfig: MusicComponentConfiguration = {
    votable: false,
    deletable: false,
    queueable: false,
    backlog: false,
  };

  getMusicConfig(queue: QueueDtoDto) {
    const user = this.user.loggedUser();
    const isQueuedByUser = user.isLoggedIn && queue.user.id === +(user.id ?? 0);
    return {
      votable: this.isEngineStarted && user.isLoggedIn,
      deletable: isQueuedByUser || (user.isLoggedIn && user.admin),
      queueable: false,
      backlog: false,
    };
  }

  constructor(
    @Inject(QueueService) private readonly queue: QueueService,
    @Inject(AuthenticationService) private readonly user: AuthenticationService,
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

  private loadQueue(queues: QueueDtoDto[]) {
    const indexPlaying = queues.findIndex(
      (q) => q.status === QueueDtoType.StatusEnum.NUMBER_1,
    );
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
