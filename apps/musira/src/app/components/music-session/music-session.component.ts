import { Component, Inject } from '@angular/core';
import { MusicSessionsService } from '../../services/music-sessions.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'musira-music-session',
  templateUrl: './music-session.component.html',
  styleUrls: ['./music-session.component.scss'],
})
export class MusicSessionComponent {
  form = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(9),
      Validators.maxLength(9),
      Validators.pattern('[0-9]*'),
    ]),
  });

  public constructor(
    @Inject(MusicSessionsService)
    private readonly musicSessions: MusicSessionsService,
  ) {}

  joinSession(code?: string) {
    const sessionCode = code || this.form.value.code;
    if (!sessionCode || this.form.invalid || !this.form.value.code) return;

    // TODO : handle error
    this.musicSessions.joinSession(sessionCode).subscribe();
  }

  get sessionHistory() {
    return this.musicSessions.getSessionHistory();
  }
}
