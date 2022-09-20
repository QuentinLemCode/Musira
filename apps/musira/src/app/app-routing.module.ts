import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin/admin.component';
import { SpotifyDeviceComponent } from './admin/spotify-device/spotify-device.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ChallengeComponent } from './login/challenge/challenge.component';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './login/password/password.component';
import { RegisterComponent } from './login/register/register.component';
import { MainComponent } from './main/main.component';
import { AdminGuard } from './shared/admin.guard';
import { AuthGuard } from './shared/auth.guard';
import { NotAuthGuard } from './shared/not-auth.guard';
import { NotFoundComponent } from './shared/not-found/not-found.component';

const routes: Routes = [
  {
    path: 'admin/spotify-device',
    component: SpotifyDeviceComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard, AdminGuard],
  },
  {
    path: 'login/password',
    component: PasswordComponent,
    canActivate: [NotAuthGuard],
  },
  {
    path: 'login/challenge',
    component: ChallengeComponent,
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
  { path: 'login', component: LoginComponent, canActivate: [NotAuthGuard] },
  { path: '', component: MainComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
