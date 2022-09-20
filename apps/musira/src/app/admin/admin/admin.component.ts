import { Component, OnInit } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import { FullUser } from '../../interfaces/user';
import { UserService } from '../../services/user.service';
import { SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  usersList: FullUser[] = [];
  maxVote: number | null = null;
  maxQueuableSongs: number | null = null;

  constructor(
    private readonly users: UserService,
    private readonly settings: SettingsService
  ) {}

  ngOnInit(): void {
    this.users.getAllUsers().subscribe({
      next: (users) => {
        this.usersList = users;
      },
    });
    this.settings.get().subscribe({
      next: (setting) => {
        this.maxVote = setting.maxVotes;
        this.maxQueuableSongs = setting.maxQueuableSongPerUser;
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

  toggleIPVerification(id: number) {
    this.users
      .toggleIPVerification(id)
      .pipe(mergeMap(() => this.users.getAllUsers()))
      .subscribe({
        next: (users) => {
          this.usersList = users;
        },
      });
  }

  setMaxVotes(value: number) {
    this.settings.setMaxVote(value).subscribe({
      next: (vote) => {
        this.maxVote = vote.maxVotes;
      },
    });
  }

  setMaxQueuableSongs(value: number) {
    this.settings.setMaxQueuableSongPerUser(value).subscribe({
      next: (vote) => {
        this.maxQueuableSongs = vote.maxQueuableSongPerUser;
      },
    });
  }
}
