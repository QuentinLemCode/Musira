import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { CreateSessionComponent } from './sessions/create-session/create-session.component';
import { RegisterComponent } from './authentication/register/register.component';
import { AdminGuard } from './shared/admin.guard';
import { AuthGuard } from './shared/auth.guard';
import { musicSessionGuard } from './shared/music-session.guard';
import { NotAuthGuard } from './shared/not-auth.guard';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { SpotifyAuthComponent } from './spotify-auth/spotify-auth.component';
import { LoginComponent } from './authentication/login/login.component';
import { SessionSettingsComponent } from './sessions/session-settings/session-settings.component';
import { MusicSessionComponent } from './sessions/music-session/music-session.component';
import { JoinSessionComponent } from './sessions/join-session/join-session.component';
import { CallbackComponent } from './authentication/callback/callback.component';
import { DeleteAccountComponent } from './authentication/delete-account/delete-account.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';

const routes: Routes = [
  {
    path: ':sessionId/session-settings',
    component: SessionSettingsComponent,
    canActivate: [musicSessionGuard, AuthGuard],
  },
  {
    path: 'oauth/callback/:provider',
    component: CallbackComponent,
  },
  {
    path: 'create-session',
    component: CreateSessionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'spotify-auth',
    component: SpotifyAuthComponent,
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent,
  },
  {
    path: 'user/login',
    component: LoginComponent,
    canActivate: [NotAuthGuard],
  },
  {
    path: 'user/register',
    component: RegisterComponent,
    canActivate: [NotAuthGuard],
  },
  {
    path: 'user/delete-account',
    component: DeleteAccountComponent,
    canActivate: [AuthGuard],
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
  { path: '', component: JoinSessionComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
