import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BacklogComponent } from './backlog/backlog.component';
import { MusicComponent } from './music/music.component';
import { MusicSessionComponent } from './music-session/music-session.component';
import { QueueComponent } from './queue/queue.component';
import { SearchComponent } from './search/search.component';
import { SpotifyLoginComponent } from './spotify-login/spotify-login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  declarations: [
    BacklogComponent,
    MusicComponent,
    MusicSessionComponent,
    QueueComponent,
    SearchComponent,
    SpotifyLoginComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    AppRoutingModule,
  ],
  exports: [
    BacklogComponent,
    MusicComponent,
    MusicSessionComponent,
    QueueComponent,
    SearchComponent,
    SpotifyLoginComponent,
  ],
})
export class ComponentsModule {}
