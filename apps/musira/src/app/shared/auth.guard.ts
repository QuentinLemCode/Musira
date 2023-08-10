import { Inject, Injectable } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import type { Observable } from 'rxjs';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(
    @Inject(UserService) private user: UserService,
    @Inject(Router) private router: Router,
  ) {}
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.user.isLoggedIn !== true) {
      this.router.navigate(['user', 'login']);
    }
    return true;
  }
}
