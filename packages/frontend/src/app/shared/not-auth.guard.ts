import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthModalService } from '../authentication/auth-modal.service';
import { AuthenticationService } from '../authentication/authentication.service';

export const notAuthGuard: CanActivateFn = async () => {
  const auth = inject(AuthenticationService);
  const router = inject(Router);

  const userState = auth.loggedUser();

  if (userState.isLoggedIn === false) {
    // Ensure we refresh from cookie-backed session before allowing access
    await auth.initializeAuth();
    const refreshed = auth.loggedUser();
    if (refreshed.isLoggedIn === true) {
      return router.createUrlTree(['/']);
    }
    const modal = inject(AuthModalService);
    modal.open('login');
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/']);
};
