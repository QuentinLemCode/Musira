import { Inject, Injectable } from '@angular/core';
import type { UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    @Inject(AuthenticationService) private user: AuthenticationService,
    @Inject(Router) private router: Router,
  ) {}
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const loggedUser = this.user.loggedUser();
    if (loggedUser.isLoggedIn && loggedUser.admin) {
      return true;
    }
    return this.router.navigate(['/']);
  }
}
