import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminComponent } from './admin/admin/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BacklogComponent } from './components/backlog/backlog.component';
import { MusicSessionComponent } from './components/music-session/music-session.component';
import { MusicComponent } from './components/music/music.component';
import { QueueComponent } from './components/queue/queue.component';
import { SearchComponent } from './components/search/search.component';
import { SpotifyLoginComponent } from './components/spotify-login/spotify-login.component';
import { CreateSessionComponent } from './create-session/create-session.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { PasswordComponent } from './login/password/password.component';
import { RegisterComponent } from './login/register/register.component';
import { MainComponent } from './main/main.component';
import { SessionSettingsComponent } from './session-settings/session-settings.component';
import { SpotifyDeviceComponent } from './session-settings/spotify-device/spotify-device.component';
import { JwtInterceptor } from './shared/jwt.interceptor';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { SpotifyAuthComponent } from './spotifyAuth/spotify-auth.component';
import { UserModule } from './user/user.module';

@NgModule({
  declarations: [
    AppComponent,
    SpotifyDeviceComponent,
    LoginComponent,
    NotFoundComponent,
    MainComponent,
    PasswordComponent,
    RegisterComponent,
    MusicComponent,
    QueueComponent,
    SearchComponent,
    AdminComponent,
    BacklogComponent,
    DashboardComponent,
    MusicSessionComponent,
    SessionSettingsComponent,
    SpotifyAuthComponent,
    CreateSessionComponent,
    SpotifyLoginComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    UserModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
