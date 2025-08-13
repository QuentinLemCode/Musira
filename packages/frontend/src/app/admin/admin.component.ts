import { CommonModule } from '@angular/common';
import type { OnInit } from '@angular/core';
import { Component, Inject, model } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { mergeMap } from 'rxjs/operators';
import { QueueService } from '../services/queue.service';
import { UsersService } from '../services/users.service';
import { MusicSessionsService } from '../sessions/music-sessions.service';
type UserResponseDTO = {
  id: number;
  name: string;
  role: string;
  type: 'EMAIL' | 'OAUTH';
  loginTries?: number;
  locked?: boolean;
  created_at: string;
  updated_at: string;
};
type MusicSessionDto = {
  id: number;
  name: string;
  code: number;
  creator: string;
  linkedToSpotify: boolean;
};

@Component({
  selector: 'musira-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  template: `
    <h1>Sessions list</h1>

    <table class="table-auto">
      <thead>
        <tr>
          Id
        </tr>
        <tr>
          Name
        </tr>
        <tr>
          Code
        </tr>
        <tr>
          Creator
        </tr>
        <tr>
          Linked to spotify
        </tr>
        <tr>
          Actions
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let session of sessionsList">
          <th>{{ session.id }}</th>
          <th>{{ session.name }}</th>
          <th>{{ session.code }}</th>
          <th>{{ session.creator }}</th>
          <th>{{ session.linkedToSpotify }}</th>
          <td>
            <button (click)="deleteSession(session.code)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h1>User list</h1>
    <table class="user-list">
      <thead>
        <tr>
          <th>id</th>
          <th>name</th>
          <th>role</th>
          <th>loginTries</th>
          <th>locked</th>
          <th>created_at</th>
          <th>updated_at</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of usersList">
          <th>{{ user.id }}</th>
          <th>{{ user.name }}</th>
          <th>{{ user.role }}</th>
          <th>{{ user.type === 'EMAIL' && user.loginTries }}</th>
          <th>{{ user.type === 'EMAIL' && user.locked }}</th>
          <th>{{ user.created_at }}</th>
          <th>{{ user.updated_at }}</th>
          <td class="actions">
            <button (click)="deleteUser(user.id)">Delete</button>
            <button (click)="unlockUser(user.id)">Unlock</button>
          </td>
        </tr>
      </tbody>
    </table>

    <h1>Import playlist into session backlog</h1>
    <label>
      Session code
      <input [value]="sessionCode()" (input)="onSessionCodeChange($event)" />
    </label>
    <label>
      Spotify Playlist id
      <input
        [value]="spotifyPlaylistId()"
        (input)="onSpotifyPlaylistIdChange($event)"
      />
    </label>
    <button (click)="importPlaylist()">Import</button>
    <p *ngIf="error">{{ error }}</p>
  `,
  styles: [
    `
      .actions {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        margin-top: 1rem;
      }
    `,
  ],
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
      next: (users: any) => {
        this.usersList = users as UserResponseDTO[];
      },
    });
    this.sessions.getAll().subscribe({
      next: (sessions: any) => {
        this.sessionsList = sessions as MusicSessionDto[];
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
            next: (users: any) => {
              this.usersList = users as UserResponseDTO[];
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
        next: (users: any) => {
          this.usersList = users as UserResponseDTO[];
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
