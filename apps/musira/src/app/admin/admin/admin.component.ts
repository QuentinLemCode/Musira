import type { OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type { UserResponseDTO } from '@musira/api-interfaces/index';
import { mergeMap } from 'rxjs/operators';
import { UserService } from '../../user/user.service';

@Component({
  selector: 'musira-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  usersList: UserResponseDTO[] = [];

  constructor(@Inject(UserService) private readonly users: UserService) {}

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
}
