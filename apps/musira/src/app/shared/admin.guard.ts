import { Inject, Injectable } from '@angular/core';
import type { UrlTree } from '@angular/router';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { UserService } from '../services/user.service';

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
    if (this.user.isLoggedIn !== true && !this.user.isAdmin()) {
      this.router.navigate(['/']);
    }
    return true;
  }
}
