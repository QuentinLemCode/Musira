import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type {
  MusicSessionDto,
  UserResponseDTO,
} from '@musira/api-interfaces/index';
import { mergeMap } from 'rxjs/operators';
import { UserService } from '../../user/user.service';
import { MusicSessionsService } from '../../sessions/music-sessions.service';

@Component({
  selector: 'musira-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  usersList: UserResponseDTO[] = [];
  sessionsList: MusicSessionDto[] = [];

  constructor(
    @Inject(UserService) private readonly users: UserService,
    @Inject(MusicSessionsService)
    private readonly sessions: MusicSessionsService,
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

  deleteUser(id: number) {
    this.users
      .delete(id)
      .pipe(mergeMap(() => this.users.getAllUsers()))
      .subscribe({
        next: (users) => {
          this.usersList = users;
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
}
