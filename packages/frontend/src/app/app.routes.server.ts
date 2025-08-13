import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: ':sessionId/session-settings',
    renderMode: RenderMode.Client,
  },
  {
    path: 'oauth/callback/:provider',
    renderMode: RenderMode.Client,
  },
  {
    path: 'create-session',
    renderMode: RenderMode.Client,
  },
  {
    path: 'spotify-auth',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin',
    renderMode: RenderMode.Client,
  },
  {
    path: 'privacy-policy',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'user/login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'user/register',
    renderMode: RenderMode.Client,
  },
  {
    path: 'user/delete-account',
    renderMode: RenderMode.Client,
  },
  {
    path: ':sessionId/dashboard',
    renderMode: RenderMode.Server,
  },
  {
    path: ':sessionId',
    renderMode: RenderMode.Client,
  },
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
