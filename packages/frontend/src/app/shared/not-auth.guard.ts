import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
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
      'User not logged in after refresh, allowing access to login page',
    );
    return true;
  }

  console.log('User is logged in, redirecting to home page');
  return router.createUrlTree(['/']);
};
