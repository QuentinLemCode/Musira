import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    @Inject(AuthenticationService) private user: AuthenticationService,
    @Inject(Router) private router: Router,
  ) {}
  canActivate() {
    if (this.user.loggedUser().isLoggedIn !== true) {
      return this.router.navigate(['user', 'login']);
    }
    return true;
  }
}
