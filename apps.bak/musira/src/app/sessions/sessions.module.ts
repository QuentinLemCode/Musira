import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from '../app-routing.module';
import { ComponentsModule } from '../components/components.module';
import { CreateSessionComponent } from './create-session/create-session.component';
import { JoinSessionComponent } from './join-session/join-session.component';
import { MusicSessionComponent } from './music-session/music-session.component';
import { MusicSessionsService } from './music-sessions.service';
import { SessionSettingsComponent } from './session-settings/session-settings.component';

@NgModule({
  declarations: [
    CreateSessionComponent,
    JoinSessionComponent,
    MusicSessionComponent,
    SessionSettingsComponent,
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
