import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthModalService } from '../authentication/auth-modal.service';
import { AuthenticationService } from '../authentication/authentication.service';

export const notAuthGuard: CanActivateFn = async () => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  const userState = auth.loggedUser();
  console.log('notAuthGuard called with userState:', userState);

  if (userState.isLoggedIn === false) {
    // Ensure we refresh from cookie-backed session before allowing access
    await auth.initializeAuth();
    const refreshed = auth.loggedUser();
    if (refreshed.isLoggedIn === true) {
      console.log('User became logged in after refresh, redirecting');
      return router.createUrlTree(['/']);
    }
    console.log(
      'User not logged in after refresh, redirecting home and opening modal',
    );
    const modal = inject(AuthModalService);
    modal.open('login');
    return router.createUrlTree(['/']);
  }

  console.log('User is logged in, redirecting to home page');
  return router.createUrlTree(['/']);
};
