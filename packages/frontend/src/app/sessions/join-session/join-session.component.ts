import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { intlFormat } from 'date-fns';
import { codeToString, stringToCode } from '../../utils/format-code';
import { MusicSessionsService } from '../music-sessions.service';

@Component({
  selector: 'musira-join-session',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
  template: `
    <main>
      <h1>Créer une session musicale</h1>
      <div class="flex items-baseline mt-4">
        <p class="font-bold w-1/2">
          Faites décoller vos soirées en faisant participer vos amis à la
          playlist !
        </p>
        <button class="ml-8" routerLink="create-session">
          Créer une session
        </button>
      </div>
      <hr class="mt-16" />

      <h1>Rejoindre une session</h1>
      <p class="font-bold mt-4 mb-4">Fais passer tes meilleurs sons !</p>
      <p class="mb-4">
        Tu auras besoin du code de session, demande-le à l'organisateur
      </p>
      <form
        class="flex flex-row flex-wrap justify-center items-end gap-4"
        [formGroup]="form"
        (ngSubmit)="joinSession()"
      >
        <div class="join-session">
          <label for="code">Code de session</label>
          <input
            type="text"
            (input)="onInputChange($event)"
            name="code"
            formControlName="code"
            placeholder="123-456-789"
          />
        </div>
        <button (click)="joinSession()" [disabled]="form.invalid">
          Rejoindre une session
        </button>
      </form>
      @if (form.controls.code.invalid && form.controls.code.touched) {
        <div id="form-error" class="error">
          Le code de session doit comporter 9 chiffres.
        </div>
      }
      @if (joinSessionError) {
        <div class="error">{{ joinSessionError }}</div>
      }
    </main>

    @if (hasSessionHistory) {
      <h2 class="mt-16 mb-8">Historique des sessions</h2>
    }
    <div class="grid grid-cols-3 gap-4">
      @for (session of sessionHistory; track session.musicSession.code) {
        <a
          class="session-history shadow-md shadow-yellow-primary bg-yellow-primary hover:bg-yellow-secondary rounded-xl"
          (click)="joinSessionWithCode(session.musicSession.code)"
        >
          <p
            class="text-center font-bold m-4 text-xl whitespace-nowrap overflow-hidden text-ellipsis"
          >
            🎉 {{ session.musicSession.name }}
          </p>
          <div class="text-sm text-center ml-1">
            organisé par
            <span class="bold">{{ session.musicSession.creator }}</span>
          </div>
          <hr class="mt-2" />
          <p class="m-1">
            Rejoint le {{ formatDate(session.access_date) }}<br />
          </p>
          <div class="italic text-right mr-4">
            #{{ formatCode(session.musicSession.code) }}
          </div>
        </a>
      }
    </div>
  `,
  styles: [
    `
      @use '../../../colors.scss' as *;

      form {
        div.join-session {
          display: flex;
          flex-direction: column;
          margin: 0 1rem 0 1rem;

          input {
            height: 3rem;
          }

          label {
            margin-left: 1rem;
          }
        }

        button {
          margin-bottom: 2px;
        }
      }

      .session-history {
        // color: var(--neutral);
        color: var(--bg-secondary);
      }
    `,
  ],
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
        // no-op: backend-driven history
        this.joinSessionError = 'Ce code de session est invalide';
      },
    });
  }
}
