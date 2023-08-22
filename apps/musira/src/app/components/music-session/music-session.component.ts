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

  joinSession() {
    if (this.form.invalid || !this.form.value.code) return;
    this.joinSessionRequest(this.form.value.code);
  }

  joinSessionWithCode(code: number) {
    this.joinSessionRequest(code.toString());
  }

  get sessionHistory() {
    return this.musicSessions.getSessionHistory();
  }

  private joinSessionRequest(code: string) {
    // TODO : handle error
    this.musicSessions.joinSession(code).subscribe();
  }
}
