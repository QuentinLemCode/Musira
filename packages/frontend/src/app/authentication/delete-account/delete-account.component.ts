import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../../services/users.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'musira-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrl: './delete-account.component.scss',
  standalone: true,
  imports: [CommonModule],
})
export class DeleteAccountComponent {
  constructor(
    @Inject(AuthenticationService) private readonly auth: AuthenticationService,
    @Inject(UsersService) private readonly user: UsersService,
    @Inject(Router) private readonly router: Router,
  ) {}

  deleteAccount() {
    const user = this.auth.loggedUser();
    if (user.isLoggedIn) {
      this.user.delete().subscribe({
        next: () => {
          this.auth.logout();
          this.router.navigate(['/']);
        },
      });
    }
  }
}
