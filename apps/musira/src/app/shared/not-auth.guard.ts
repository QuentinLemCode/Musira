import { Inject, Injectable } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import type { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root',
})
export class NotAuthGuard {
  constructor(
    @Inject(UserService) private user: UserService,
    @Inject(Router) private router: Router,
  ) {}
  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.user.isLoggedIn === false) {
      return true;
    }
    return this.router.navigate(['/']);
  }
}
