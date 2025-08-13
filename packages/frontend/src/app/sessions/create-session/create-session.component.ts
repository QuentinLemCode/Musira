import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CreateMusicSessionDto } from '@musira/api';
import { firstValueFrom } from 'rxjs';
import { SpotifyLoginComponent } from '../../components/spotify-login/spotify-login.component';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-create-session',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    SpotifyLoginComponent,
  ],
  template: `
    <form [formGroup]="createSessionForm">
      <label
        >Nom de la session :<input
          type="text"
          name="session-name"
          #sessionName
          formControlName="name"
      /></label>
    </form>
    <!-- <p>
  You need a valid Spotify Premium account to create a session.<br />
  We do not store any of your spotify data, we only use it to play music on your Spotify
  account.
</p> -->
    <p>
      Vous avez besoin d'un compte Spotify Premium pour créer une session. Nous
      ne stockons aucune de vos données Spotify, nous l'utilisons uniquement
      pour lancer les musiques sur votre appareil.
    </p>
    <musira-spotify-login
      [beforeLoginHandler]="createSession(sessionName.value)"
      [disabled]="name?.invalid || false"
    ></musira-spotify-login>
  `,
  styles: [``],
})
export class CreateSessionComponent {
  constructor(
    @Inject(MusicSessionsService)
    private readonly musicSessions: MusicSessionsService,
  ) {}

  createSessionForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  get name() {
    return this.createSessionForm.get('name');
  }

  createSession = (name: string) => async () => {
    await firstValueFrom(
      this.musicSessions.create(new CreateMusicSessionDto(name)),
    );
  };
}
