import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { intlFormat } from 'date-fns';
import { codeToString, stringToCode } from '../../utils/format-code';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-join-session',
  templateUrl: './join-session.component.html',
  styleUrls: ['./join-session.component.scss'],
})
export class JoinSessionComponent {
  form = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11),
      Validators.pattern('[0-9-]*'),
    ]),
  });

  joinSessionError = '';

  public constructor(
    @Inject(MusicSessionsService)
    private readonly musicSessions: MusicSessionsService,
    @Inject(Router) private readonly router: Router,
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

  get hasSessionHistory() {
    return this.sessionHistory.length > 0;
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
    const publicCode = stringToCode(code);
    this.musicSessions.joinSession(publicCode).subscribe({
      next: () => this.router.navigate([publicCode]),
      error: () => {
        this.musicSessions.deleteSessionInHistory(publicCode);
        this.joinSessionError = 'Ce code de session est invalide';
      },
    });
  }
}
