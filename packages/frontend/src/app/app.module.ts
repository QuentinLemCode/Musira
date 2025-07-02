import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminComponent } from './admin/admin.component';

import { ComponentsModule } from './components/components.module';
import { NavigationModule } from './navigation/navigation.module';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { DashboardService } from './services/dashboard.service';
import { SessionsModule } from './sessions/sessions.module';
import { jwtInterceptor } from './shared/jwt.interceptor';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { withCredentialsInterceptor } from './shared/with-credentials.interceptor';
import { SpotifyAuthComponent } from './spotify-auth/spotify-auth.component';

@NgModule({
  declarations: [
    NotFoundComponent,
    AdminComponent,
    SpotifyAuthComponent,
    PrivacyPolicyComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ComponentsModule,
    SessionsModule,
    NavigationModule,
  ],
  providers: [DashboardService, withCredentialsInterceptor, jwtInterceptor],
})
export class AppModule {}
