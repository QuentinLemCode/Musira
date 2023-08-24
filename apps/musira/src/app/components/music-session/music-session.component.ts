import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { intlFormat } from 'date-fns';
import { MusicSessionsService } from '../../services/music-sessions.service';
import { codeToString } from '../../utils/format-code';

@Component({
  selector: 'musira-music-session',
  templateUrl: './music-session.component.html',
  styleUrls: ['./music-session.component.scss'],
})
export class MusicSessionComponent {
  form = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11),
      Validators.pattern('[0-9-]*'),
    ]),
  });

  public constructor(
    @Inject(MusicSessionsService)
    private readonly musicSessions: MusicSessionsService,
  ) {}

  onInputChange(event: Event) {
    if (!(event instanceof InputEvent)) return;
    const value = this.form.controls.code.value?.replaceAll(/[^0-9]/g, '');
    if (value === undefined || value === null) return;
    if (value.length > 6) {
      this.form.controls.code.setValue(
        `${value.substring(0, 3)}-${value.substring(3, 6)}-${value.substring(
          6,
          9,
        )}`,
      );
    } else if (value.length > 3) {
      this.form.controls.code.setValue(
        `${value.substring(0, 3)}-${value.substring(3, 6)}`,
      );
    } else {
      this.form.controls.code.setValue(value);
    }
  }

  joinSession() {
    if (this.form.invalid || !this.form.value.code) return;
    this.joinSessionRequest(this.form.value.code);
  }

  joinSessionWithCode(code: number) {
    this.joinSessionRequest(code.toString());
  }

  get sessionHistory() {
    return this.musicSessions
      .getSessionHistory()
      .sort((a, b) => b.access_date.getTime() - a.access_date.getTime());
  }

  formatDate(date: Date) {
    return intlFormat(
      new Date(date),
      {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      },
      {
        locale: 'fr-FR',
      },
    );
  }

  formatCode(code: number) {
    return codeToString(code);
  }

  private joinSessionRequest(code: string) {
    // TODO : handle error
    this.musicSessions.joinSession(code).subscribe();
  }
}
