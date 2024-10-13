import {
  Component,
  HostListener,
  Inject,
  Input,
  type OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
  faAdd,
  faCheck,
  faClose,
  faSearch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  mergeMap,
  tap,
} from 'rxjs/operators';
import type { Music } from '../../services/music-api.interface';
import { MusicApiService } from '../../services/music-api.service';
import { QueueService } from '../../services/queue.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';
import type {
  IconUpdateStatus,
  MusicComponentConfiguration,
} from '../music/music.component';

@Component({
  selector: 'musira-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  static readonly ERROR_MESSAGE = "Une erreur s'est produite, désolé 😫";
  static readonly ALREADY_IN_QUEUE =
    "Cette musique est déjà dans la file d'attente";
  static readonly ALREADY_IN_BACKLOG = 'Cette musique est déjà dans le backlog';

  @Input() forBacklog = false;

  search = new FormControl<string>('');
  results: Music[] | null = null;
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

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.resultsHidden = true;
  }

  constructor(
    @Inject(MusicApiService) private readonly music: MusicApiService,
    @Inject(QueueService) private readonly queue: QueueService,
    @Inject(MusicSessionsService)
    private readonly session: MusicSessionsService,
  ) {
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

  addToQueue(music: Music, updateIcon: IconUpdateStatus) {
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

  addToBacklog(music: Music, updateIcon: IconUpdateStatus) {
    updateIcon.updateLoading(true);
    this.queue.pushBacklog(music).subscribe({
      next: () => {
        updateIcon.updateIcon(faCheck);
        updateIcon.updateLoading(false);
        updateIcon.completeEmitter();
      },
      error: (error) => {
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
