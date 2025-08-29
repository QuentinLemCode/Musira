import { CommonModule } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  Input,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faAdd,
  faCheck,
  faClose,
  faSearch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import type { MusicDto } from '@musira/client';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  mergeMap,
  tap,
} from 'rxjs/operators';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';
import {
  MusicComponent,
  type IconUpdateStatus,
  type MusicComponentConfiguration,
} from '../music/music.component';

@Component({
  selector: 'musira-search',
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
    <input
      type="text"
      (focus)="showResults()"
      [formControl]="search"
      placeholder="Rechercher une musique"
    />
    @if (results === null || resultsHidden) {
      <span class="search-icon"
        ><fa-icon
          [icon]="iconSearch"
          [ngClass]="loading ? 'fa-beat-fade' : ''"
        ></fa-icon
      ></span>
    }

    @if (results !== null && !resultsHidden) {
      <span class="search-icon cursor-pointer">
        <fa-icon
          [icon]="iconClose"
          (click)="hideResults({ clearInput: true })"
        ></fa-icon>
      </span>
    }

    @if (error) {
      <p>{{ error }}</p>
    }

    @if (!resultsHidden) {
      <div
        id="search-results"
        [ngClass]="resultsHidden || results === null ? 'hide' : 'show'"
      >
        @for (music of results ?? []; track music.uri) {
          <musira-music
            [music]="music"
            [config]="musicConfig"
            (addToQueue)="addToQueue(music, $event)"
            (addToBacklog)="addToBacklog(music, $event)"
          ></musira-music>
        }
      </div>
    }
  `,
  styles: [
    `
      @use '../../../colors.scss' as *;

      :host {
        border-radius: 33px;
        background: var(--bg-secondary);
        margin: 20px 0;
        padding: 14px;
        display: block;
      }

      app-music {
        background: var(--bg-secondary);
      }

      input {
        width: 100%;
        background: var(--bg-primary);
        color: var(--font-secondary);
        &::placeholder {
          color: var(--font-secondary);
        }
      }

      fa-icon {
        margin-right: 20px;
        float: right;
        font-size: 28px;
        margin-top: -56px;
        position: relative;
      }

      #search-results {
        overflow: hidden;
        transform: scaleY(0);
        transform-origin: top;
        transition: transform 0.5s ease;

        &.show {
          margin-top: 12px;
          transform: scaleY(1);
          transform-origin: top;
        }
      }
    `,
  ],
})
export class SearchComponent implements OnInit {
  static readonly ERROR_MESSAGE = "Une erreur s'est produite, désolé 😫";
  static readonly ALREADY_IN_QUEUE =
    "Cette musique est déjà dans la file d'attente";
  static readonly ALREADY_IN_BACKLOG = 'Cette musique est déjà dans le backlog';

  private readonly music = inject(MusicApiService);
  private readonly queue = inject(QueueService);
  private readonly session = inject(MusicSessionsService);

  @Input() forBacklog = false;

  search = new FormControl<string>('');
  results: MusicDto[] | null = null;
  resultsHidden = false;
  loading = false;
  error = '';
  currentSession = this.session.currentSession();
  musicConfig: MusicComponentConfiguration = {
    votable: false,
    deletable: false,
    queueable: true,
    backlog: false,
  };

  iconSearch = faSearch;
  iconClose = faClose;

  @HostListener('window:popstate')
  onPopState() {
    this.resultsHidden = true;
  }

  constructor() {
    this.search.valueChanges
      .pipe(
        takeUntilDestroyed(),
        filter<string | null, string>(
          (query): query is string => typeof query === 'string',
        ),
        distinctUntilChanged(),
        tap(() => (this.loading = true)),
        debounceTime(500),
        mergeMap((query) => {
          if (query === '') {
            return of(null);
          }
          return this.music.search(query).pipe(
            tap(() => (this.error = '')),
            catchError(() => {
              this.error = SearchComponent.ERROR_MESSAGE;
              this.loading = false;
              return of(null);
            }),
          );
        }),
      )
      .subscribe({
        next: (results) => {
          this.results = results;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.results = null;
          this.error = SearchComponent.ERROR_MESSAGE;
        },
      });
  }

  ngOnInit(): void {
    if (this.forBacklog) {
      this.musicConfig.queueable = false;
      this.musicConfig.backlog = true;
    }
  }

  hideResults({ clearInput }: { clearInput?: boolean } = {}) {
    if (clearInput) {
      this.search.reset();
    }
    this.resultsHidden = true;
  }

  showResults() {
    this.resultsHidden = false;
  }

  addToQueue(music: MusicDto, updateIcon: IconUpdateStatus) {
    updateIcon.updateLoading(true);
    this.queue.push(music).subscribe({
      next: () => {
        updateIcon.updateIcon(faCheck);
        updateIcon.updateLoading(false);
        updateIcon.completeEmitter();
      },
      error: (error) => {
        updateIcon.updateLoading(false);
        updateIcon.updateIcon(faXmark);
        if (error?.error?.cause === 'queue') {
          this.error = SearchComponent.ALREADY_IN_QUEUE;
        } else if (error?.error?.cause === 'queue-limit') {
          const queueLimit = error?.error?.limit;
          this.error = `Vous avez déjà ${
            queueLimit || 'plusieurs'
          } musiques dans la file d'attente. Veuillez attendre qu'elle soient terminées ou les supprimer pour en ajouter d'autres.`;
        } else {
          this.error = SearchComponent.ERROR_MESSAGE;
        }

        setTimeout(() => {
          this.error = '';
          updateIcon.updateIcon(faAdd);
        }, 5000);
      },
    });
  }

  addToBacklog(music: MusicDto, updateIcon: IconUpdateStatus) {
    updateIcon.updateLoading(true);
    this.queue.pushBacklog(music).subscribe({
      next: () => {
        updateIcon.updateIcon(faCheck);
        updateIcon.updateLoading(false);
        updateIcon.completeEmitter();
      },
      error: (error: any) => {
        updateIcon.updateLoading(false);
        updateIcon.updateIcon(faXmark);
        if (error?.error?.cause === 'backlog') {
          this.error = SearchComponent.ALREADY_IN_BACKLOG;
        } else {
          this.error = SearchComponent.ERROR_MESSAGE;
        }
        setTimeout(() => {
          this.error = '';
          updateIcon.updateIcon(faAdd);
        }, 5000);
      },
    });
  }
}
