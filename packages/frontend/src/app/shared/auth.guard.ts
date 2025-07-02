import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from '../authentication/authentication.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthenticationService);

  const userState = authService.loggedUser();

  console.log('authGuard called with userState:', userState);

  if (userState.isLoggedIn === true) {
    console.log('User is logged in, allowing access');
    return true;
  } else {
    console.log('User not logged in, redirecting to login');
    return router.createUrlTree(['/user/login']);
  }
};
