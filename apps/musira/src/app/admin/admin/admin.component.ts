import { Component, OnInit } from '@angular/core';
import { mergeMap } from 'rxjs/operators';
import { FullUser } from '../../interfaces/user';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'musira-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  usersList: FullUser[] = [];

  constructor(private readonly users: UserService) {}

  ngOnInit(): void {
    this.users.getAllUsers().subscribe({
      next: (users) => {
        this.usersList = users;
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
}
