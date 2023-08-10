import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AdminComponent } from './admin/admin/admin.component';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ComponentsModule } from './components/components.module';
import { MainComponent } from './main/main.component';
import { SessionSettingsComponent } from './session-settings/session-settings.component';
import { SpotifyDeviceComponent } from './session-settings/spotify-device/spotify-device.component';
import { JwtInterceptor } from './shared/jwt.interceptor';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { SpotifyAuthComponent } from './spotifyAuth/spotify-auth.component';
import { UserModule } from './user/user.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateSessionComponent } from './create-session/create-session.component';

@NgModule({
  declarations: [
    AppComponent,
    SpotifyDeviceComponent,
    NotFoundComponent,
    MainComponent,
    AdminComponent,
    DashboardComponent,
    SessionSettingsComponent,
    SpotifyAuthComponent,
    CreateSessionComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    UserModule,
    ComponentsModule,
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
