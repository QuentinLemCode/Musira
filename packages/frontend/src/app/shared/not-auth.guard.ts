import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

export const notAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  const userState = auth.loggedUser();
  console.log('notAuthGuard called with userState:', userState);

  if (userState.isLoggedIn === false) {
    console.log('User not logged in, allowing access to login page');
    return true;
  }

  console.log('User is logged in, redirecting to home page');
  return router.createUrlTree(['/']);
};
