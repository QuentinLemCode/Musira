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
    title: 'Session settings — Musira',
    data: {
      robots: 'noindex, nofollow',
    },
  },
  {
    path: 'oauth/callback/:provider',
    loadComponent: () =>
      import('./authentication/callback/callback.component').then(
        (m) => m.CallbackComponent,
      ),
    title: 'Authenticating… — Musira',
    data: {
      robots: 'noindex, nofollow',
      description: 'Authentication callback. You can close this page.',
    },
  },
  {
    path: 'create-session',
    loadComponent: () =>
      import('./sessions/create-session/create-session.component').then(
        (m) => m.CreateSessionComponent,
      ),
    canActivate: [authGuard],
    title: 'Create a session — Musira',
    data: {
      description:
        'Start a collaborative music session and invite friends to add songs to the queue.',
      robots: 'noindex, nofollow',
    },
  },
  {
    path: 'spotify-auth',
    loadComponent: () =>
      import('./spotify-auth/spotify-auth.component').then(
        (m) => m.SpotifyAuthComponent,
      ),
    title: 'Connect Spotify — Musira',
    data: {
      robots: 'noindex, nofollow',
      description:
        'Connect your Spotify account to enable playback and search in Musira.',
    },
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    canActivate: [authGuard, AdminGuard],
    title: 'Admin — Musira',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
    title: 'Privacy Policy — Musira',
    data: {
      titleFr: 'Politique de confidentialité — Musira',
      titleEn: 'Privacy Policy — Musira',
      description:
        'Learn how Musira collects and processes data to run collaborative music sessions securely.',
      descriptionFr:
        'Découvrez comment Musira collecte et traite les données pour faire fonctionner les sessions musicales collaboratives en toute sécurité.',
      descriptionEn:
        'Learn how Musira collects and processes data to run collaborative music sessions securely.',
    },
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
    title: 'Delete account — Musira',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: ':sessionId/dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    title: 'Dashboard — Musira',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: ':sessionId',
    loadComponent: () =>
      import('./sessions/music-session/music-session.component').then(
        (m) => m.MusicSessionComponent,
      ),
    canActivate: [musicSessionGuard],
    title: 'Music session — Musira',
    data: { robots: 'noindex, nofollow' },
  },
  {
    path: '',
    loadComponent: () =>
      import('./landing/landing.component').then((m) => m.LandingComponent),
    title: 'Musira — Collaborative music sessions',
    data: {
      titleFr: 'Musira — Sessions musicales collaboratives',
      titleEn: 'Musira — Collaborative music sessions',
      description:
        'Host collaborative music sessions, queue songs with friends, and control playback together. Works with Spotify.',
      descriptionFr:
        'Organisez des sessions musicales collaboratives, ajoutez des morceaux entre amis et contrôlez la lecture ensemble. Fonctionne avec Spotify.',
      descriptionEn:
        'Host collaborative music sessions, queue songs with friends, and control playback together. Works with Spotify.',
      ogImage: '/public/logo-with-title-dark.webp',
    },
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/not-found/not-found.component').then(
        (m) => m.NotFoundComponent,
      ),
    title: 'Page not found — Musira',
    data: { robots: 'noindex, nofollow' },
  },
];
