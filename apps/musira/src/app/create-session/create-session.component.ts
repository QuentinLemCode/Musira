import { Component, OnInit } from '@angular/core';
import { MusicSessionsService } from '../services/music-sessions.service';
import { CreateMusicSessionDto } from '@musira/api-interfaces/sessions/create-music-session.dto';
import { firstValueFrom } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'musira-create-session',
  templateUrl: './create-session.component.html',
  styleUrls: ['./create-session.component.scss'],
})
export class CreateSessionComponent implements OnInit {
  constructor(private readonly musicSessions: MusicSessionsService) {}

  createSessionForm!: FormGroup;

  ngOnInit(): void {
    this.createSessionForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)]),
    });
  }

  get name() { return this.createSessionForm.get('name') }

  createSession = (name: string) => async () => {
    await firstValueFrom(
      this.musicSessions.create(new CreateMusicSessionDto(name)),
    );
  };
}
