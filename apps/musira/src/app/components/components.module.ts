import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BacklogComponent } from './backlog/backlog.component';
import { MusicComponent } from './music/music.component';
import { QueueComponent } from './queue/queue.component';
import { SearchComponent } from './search/search.component';
import { SpotifyLoginComponent } from './spotify-login/spotify-login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AppRoutingModule } from '../app-routing.module';
import { SpotifyStatusComponent } from './spotify-status/spotify-status.component';

@NgModule({
  declarations: [
    BacklogComponent,
    MusicComponent,
    QueueComponent,
    SearchComponent,
    SpotifyLoginComponent,
    SpotifyStatusComponent,
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
    QueueComponent,
    SearchComponent,
    SpotifyLoginComponent,
    SpotifyStatusComponent,
  ],
})
export class ComponentsModule {}
