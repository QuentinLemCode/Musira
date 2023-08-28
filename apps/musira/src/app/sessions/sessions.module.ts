import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentsModule } from '../components/components.module';
import { CreateSessionComponent } from './create-session/create-session.component';
import { JoinSessionComponent } from './join-session/join-session.component';
import { MusicSessionComponent } from './music-session/music-session.component';
import { MusicSessionsService } from './music-sessions.service';
import { SessionSettingsComponent } from './session-settings/session-settings.component';
import { SpotifyDeviceComponent } from './session-settings/spotify-device/spotify-device.component';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from '../app-routing.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    CreateSessionComponent,
    JoinSessionComponent,
    MusicSessionComponent,
    SessionSettingsComponent,
    SpotifyDeviceComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ComponentsModule,
    AppRoutingModule,
    FontAwesomeModule,
  ],
  exports: [],
  providers: [MusicSessionsService],
})
export class SessionsModule {}
