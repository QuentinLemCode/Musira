import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthModalService } from '../authentication/auth-modal.service';
import { AuthenticationService } from '../authentication/authentication.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthenticationService);

  const userState = authService.loggedUser();

  if (userState.isLoggedIn === true) {
    return true;
  }
  const modal = inject(AuthModalService);
  modal.open('login');
  return router.createUrlTree(['/']);
};
