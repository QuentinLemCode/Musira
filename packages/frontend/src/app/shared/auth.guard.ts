import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthModalService } from '../authentication/auth-modal.service';
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
    console.log(
      'User not logged in, redirecting to home and opening login modal',
    );
    const modal = inject(AuthModalService);
    modal.open('login');
    return router.createUrlTree(['/']);
  }
};
