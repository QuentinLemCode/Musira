import type { OnInit } from '@angular/core';
import { Component, Inject, model } from '@angular/core';
import type { MusicSessionDto, UserResponseDTO } from '@musira/api';
import { mergeMap } from 'rxjs/operators';
import { QueueService } from '../services/queue.service';
import { UsersService } from '../services/users.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';

@Component({
  selector: 'musira-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  usersList: UserResponseDTO[] = [];
  sessionsList: MusicSessionDto[] = [];

  sessionCode = model('');
  spotifyPlaylistId = model('');
  error = '';

  constructor(
    @Inject(UsersService)
    private readonly users: UsersService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
    @Inject(QueueService)
    private readonly queue: QueueService,
  ) {}

  ngOnInit(): void {
    this.users.getAllUsers().subscribe({
      next: (users) => {
        this.usersList = users;
      },
    });
    this.sessions.getAll().subscribe({
      next: (sessions) => {
        this.sessionsList = sessions;
      },
    });
  }

  importPlaylist() {
    const code = parseInt(this.sessionCode(), 10);
    if (
      this.sessionCode.length !== 9 ||
      Number.isNaN(code) ||
      !this.spotifyPlaylistId
    ) {
      this.error = 'Invalid session code or playlist id';
      return;
    }
    this.queue.importPlaylist(code, this.spotifyPlaylistId()).subscribe({
      next: (result) => {
        this.error = JSON.stringify(result);
      },
      error: (err) => {
        this.error = JSON.stringify(err);
      },
    });
  }

  deleteUser(id: number) {
    this.users
      .delete(id)
      .pipe(mergeMap(() => this.users.getAllUsers()))
      .subscribe({
        next: () => {
          this.users.getAllUsers().subscribe({
            next: (users) => {
              this.usersList = users;
            },
          });
        },
      });
  }

  unlockUser(id: number) {
    this.users
      .unlock(id)
      .pipe(mergeMap(() => this.users.getAllUsers()))
      .subscribe({
        next: (users) => {
          this.usersList = users;
        },
      });
  }

  deleteSession(code: number) {
    this.sessions
      .deleteSession(code)
      .pipe(mergeMap(() => this.sessions.getAll()))
      .subscribe();
  }

  onSessionCodeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.sessionCode.update(() => value.trim().toLowerCase());
  }

  onSpotifyPlaylistIdChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.spotifyPlaylistId.update(() => value.trim().toLowerCase());
  }
}
