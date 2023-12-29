import { Inject, Injectable } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import type { Observable } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class NotAuthGuard {
  constructor(
    @Inject(AuthenticationService) private user: AuthenticationService,
    @Inject(Router) private router: Router,
  ) {}
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.user.loggedUser().isLoggedIn === false) {
      return true;
    }
    return this.router.navigate(['/']);
  }
}
