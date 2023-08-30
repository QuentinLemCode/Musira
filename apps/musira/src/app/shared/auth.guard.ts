import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    @Inject(UserService) private user: UserService,
    @Inject(Router) private router: Router,
  ) {}
  canActivate() {
    if (this.user.isLoggedIn !== true) {
      return this.router.navigate(['user', 'login']);
    }
    return true;
  }
}
