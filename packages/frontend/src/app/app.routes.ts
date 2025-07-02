import { Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { CallbackComponent } from './authentication/callback/callback.component';
import { DeleteAccountComponent } from './authentication/delete-account/delete-account.component';
import { LoginComponent } from './authentication/login/login.component';
import { RegisterComponent } from './authentication/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { CreateSessionComponent } from './sessions/create-session/create-session.component';
import { JoinSessionComponent } from './sessions/join-session/join-session.component';
import { MusicSessionComponent } from './sessions/music-session/music-session.component';
import { SessionSettingsComponent } from './sessions/session-settings/session-settings.component';
import { AdminGuard } from './shared/admin.guard';
import { authGuard } from './shared/auth.guard';
import { musicSessionGuard } from './shared/music-session.guard';
import { notAuthGuard } from './shared/not-auth.guard';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { SpotifyAuthComponent } from './spotify-auth/spotify-auth.component';

export const routes: Routes = [
  {
    path: ':sessionId/session-settings',
    component: SessionSettingsComponent,
    canActivate: [musicSessionGuard, authGuard],
  },
  {
    path: 'oauth/callback/:provider',
    component: CallbackComponent,
  },
  {
    path: 'create-session',
    component: CreateSessionComponent,
    canActivate: [authGuard],
  },
  {
    path: 'spotify-auth',
    component: SpotifyAuthComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, AdminGuard],
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'user/login',
    component: LoginComponent,
    canActivate: [notAuthGuard],
  },
  {
    path: 'user/register',
    component: RegisterComponent,
    canActivate: [notAuthGuard],
  },
  {
    path: 'user/delete-account',
    component: DeleteAccountComponent,
    canActivate: [authGuard],
  },
  {
    path: ':sessionId/dashboard',
    component: DashboardComponent,
  },
  {
    path: ':sessionId',
    component: MusicSessionComponent,
    canActivate: [musicSessionGuard],
  },
  { path: '', component: JoinSessionComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent },
];
