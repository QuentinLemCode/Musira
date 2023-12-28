import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { OAuthModule } from 'angular-oauth2-oidc';
import { AdminComponent } from './admin/admin/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NavigationModule } from './navigation/navigation.module';
import { DashboardService } from './services/dashboard.service';
import { SessionsModule } from './sessions/sessions.module';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { OAuthInterceptor } from './shared/oauth.interceptor';
import { SpotifyAuthComponent } from './spotify-auth/spotify-auth.component';
import { UserModule } from './user/user.module';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    AdminComponent,
    DashboardComponent,
    SpotifyAuthComponent,
  ],
  imports: [
    CommonModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    UserModule,
    ComponentsModule,
    SessionsModule,
    NavigationModule,
    OAuthModule.forRoot(),
  ],
  providers: [
    DashboardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: OAuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
