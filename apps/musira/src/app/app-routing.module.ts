import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin/admin.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { CreateSessionComponent } from './create-session/create-session.component';
import { PasswordComponent } from './login/password/password.component';
import { RegisterComponent } from './login/register/register.component';
import { MainComponent } from './main/main.component';
import { SessionSettingsComponent } from './session-settings/session-settings.component';
import { AdminGuard } from './shared/admin.guard';
import { AuthGuard } from './shared/auth.guard';
import { musicSessionGuard } from './shared/music-session.guard';
import { NotAuthGuard } from './shared/not-auth.guard';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { SpotifyAuthComponent } from './spotifyAuth/spotify-auth.component';
import { LoginComponent } from './user/login/login.component';

const routes: Routes = [
  {
    path: ':sessionId/session-settings',
    component: SessionSettingsComponent,
    canActivate: [musicSessionGuard, AuthGuard, AdminGuard],
  },
  {
    path: 'create-session',
    component: CreateSessionComponent,
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
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthGuard],
  },
  {
    path: 'login/password',
    component: PasswordComponent,
    canActivate: [NotAuthGuard],
  },
  {
    path: 'login/register',
    component: RegisterComponent,
    canActivate: [NotAuthGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
  // { path: 'login', component: LoginComponent, canActivate: [NotAuthGuard] },
  {
    path: ':sessionId',
    component: MainComponent,
    canActivate: [AuthGuard, musicSessionGuard],
  },
  { path: '', component: MainComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
