import { Routes } from '@angular/router';
import { AdminGuard } from './shared/admin.guard';
import { authGuard } from './shared/auth.guard';
import { musicSessionGuard } from './shared/music-session.guard';

export const routes: Routes = [
  {
    path: ':sessionId/session-settings',
    loadComponent: () =>
      import('./sessions/session-settings/session-settings.component').then(
        (m) => m.SessionSettingsComponent,
      ),
    canActivate: [musicSessionGuard, authGuard],
  },
  {
    path: 'oauth/callback/:provider',
    loadComponent: () =>
      import('./authentication/callback/callback.component').then(
        (m) => m.CallbackComponent,
      ),
  },
  {
    path: 'create-session',
    loadComponent: () =>
      import('./sessions/create-session/create-session.component').then(
        (m) => m.CreateSessionComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'spotify-auth',
    loadComponent: () =>
      import('./spotify-auth/spotify-auth.component').then(
        (m) => m.SpotifyAuthComponent,
      ),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard, AdminGuard],
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
  },
  {
    path: 'user/login',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'user/register',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: 'user/delete-account',
    loadComponent: () =>
      import('./authentication/delete-account/delete-account.component').then(
        (m) => m.DeleteAccountComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: ':sessionId/dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
  },
  {
    path: ':sessionId',
    loadComponent: () =>
      import('./sessions/music-session/music-session.component').then(
        (m) => m.MusicSessionComponent,
      ),
    canActivate: [musicSessionGuard],
  },
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
  },
];
