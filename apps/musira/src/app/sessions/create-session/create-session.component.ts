import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { firstValueFrom } from 'rxjs';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.scss'],
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
