import { Inject, Injectable } from '@angular/core';
import type { UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard {
  constructor(
    @Inject(UserService) private user: UserService,
    @Inject(Router) private router: Router,
  ) {}
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const loggedUser = this.user.loggedUser();
    if (loggedUser.isLoggedIn && loggedUser.isAdmin) {
      return true;
    }
    return this.router.navigate(['/']);
  }
}
