import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { intlFormat } from 'date-fns';
import { AuthModalService } from '../authentication/auth-modal.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { codeToString, stringToCode } from '../utils/format-code';
import { MusicSessionsService } from './..//sessions/music-sessions.service';

@Component({
  selector: 'musira-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FontAwesomeModule],
  styles: [
    `
      @use '../../colors.scss' as *;

      :host {
        --neon: var(--primary);
        --neon-soft: color-mix(in srgb, var(--primary) 22%, transparent);
        --neon-strong: color-mix(in srgb, var(--primary) 55%, transparent);
      }

      .hero {
        margin-top: 2rem;
        position: relative;
        overflow: hidden;
        background: linear-gradient(
          135deg,
          color-mix(in srgb, var(--primary) 6%, transparent) 0%,
          transparent 55%
        );
        border: 1px solid var(--surface-border);
        border-radius: 24px;
        padding: 48px 32px;
        display: grid;
        grid-template-columns: 1.2fr 1fr;
        gap: 24px;
        align-items: center;
        box-shadow:
          0 0 0 1px var(--navbar-border) inset,
          0 10px 24px color-mix(in srgb, var(--primary) 8%, transparent),
          0 0 48px var(--neon-soft) inset;
      }
      .hero > * {
        position: relative;
        z-index: 1;
      }
      .hero::after {
        content: '';
        position: absolute;
        width: 520px;
        height: 520px;
        right: -160px;
        top: -160px;
        background: radial-gradient(
          closest-side,
          var(--neon-soft),
          transparent 62%
        );
        filter: blur(18px);
        opacity: 0.7;
        pointer-events: none;
        z-index: 0;
        animation: float 10s ease-in-out infinite alternate;
      }
      .hero::before {
        content: '';
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: repeating-linear-gradient(
          180deg,
          color-mix(in srgb, var(--neon) 10%, transparent) 0px,
          transparent 2px,
          transparent 6px
        );
        mix-blend-mode: screen;
        opacity: 0.18;
        animation: scan 6s linear infinite;
      }
      .hero h1 {
        font-size: clamp(28px, 6vw, 44px);
        line-height: 1.1;
        margin: 0 0 12px 0;
        text-shadow:
          0 0 8px var(--neon-soft),
          0 0 18px var(--neon-soft),
          0 0 28px var(--neon-strong);
        position: relative;
      }
      .hero h1::after {
        content: '';
        position: absolute;
        left: 0;
        bottom: -8px;
        width: 64px;
        height: 3px;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--neon-strong), transparent);
        box-shadow:
          0 0 16px var(--neon-strong),
          0 0 36px var(--neon-strong);
      }
      .hero p {
        color: var(--text-light);
        font-size: clamp(14px, 2.5vw, 18px);
        margin-bottom: 20px;
      }
      .cta {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cta button {
        border: 1px solid color-mix(in srgb, var(--neon) 40%, transparent);
        box-shadow:
          0 0 0 2px color-mix(in srgb, var(--neon) 16%, transparent),
          0 0 24px var(--neon-soft),
          0 0 48px var(--neon-soft);
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease,
          background 0.15s ease;
      }
      .cta button:hover {
        transform: translateY(-1px);
        background: var(--primary-hover);
        box-shadow:
          0 0 0 2px color-mix(in srgb, var(--neon) 24%, transparent),
          0 0 28px var(--neon-strong),
          0 0 56px var(--neon-strong);
      }
      .cta button:active {
        transform: translateY(0);
      }
      .card {
        border-radius: 16px;
        padding: 24px;
      }
      .join-card {
        background: var(--bg-secondary);
        color: var(--font-primary);
        border: 1px solid var(--navbar-border);
        box-shadow:
          0 2px 24px color-mix(in srgb, var(--neon) 6%, transparent),
          0 0 0 1px var(--navbar-border) inset;
      }
      .join-card input {
        background: var(--bg-primary);
        border: 1px solid var(--navbar-border);
        transition:
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }
      .join-card input:focus {
        border-color: var(--neon);
        box-shadow:
          0 0 0 2px color-mix(in srgb, var(--neon) 35%, transparent),
          0 0 22px var(--neon-soft);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 16px;
      }
      .muted {
        color: var(--text-light);
      }
      .history-card {
        background: var(--bg-secondary);
        border: 1px solid var(--navbar-border);
        border-radius: 16px;
        padding: 16px;
        text-decoration: none;
        display: grid;
        grid-template-rows: auto auto 1fr auto;
        gap: 6px;
        color: var(--font-primary);
        transition:
          transform 0.15s ease,
          box-shadow 0.15s ease,
          border-color 0.15s ease;
        box-shadow: 0 0 0 1px var(--navbar-border) inset;
      }
      .history-card:hover {
        transform: translateY(-2px);
        border-color: color-mix(in srgb, var(--neon) 30%, var(--navbar-border));
        box-shadow:
          0 6px 22px color-mix(in srgb, var(--neon) 12%, transparent),
          0 0 24px var(--neon-soft) inset;
      }
      .history-card .title {
        font-weight: 700;
        font-size: 18px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-shadow: 0 0 8px var(--neon-soft);
      }
      .history-card .meta {
        color: var(--text-light);
        font-size: 14px;
      }
      .history-card .date {
        color: var(--text-light);
        font-size: 12px;
      }
      .history-card .code {
        text-align: right;
        font-style: italic;
        color: var(--font-primary);
        text-shadow: 0 0 6px var(--neon-soft);
      }

      @keyframes float {
        0% {
          transform: translate(0, 0) scale(1);
        }
        100% {
          transform: translate(-10px, 10px) scale(1.05);
        }
      }
      @keyframes scan {
        0% {
          transform: translateY(-20%);
        }
        100% {
          transform: translateY(20%);
        }
      }

      @media (max-width: 920px) {
        .hero {
          grid-template-columns: 1fr;
        }
      }
      @media (max-width: 720px) {
        .grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 520px) {
        .grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
  template: `
    <main>
      <section class="hero">
        <div>
          <h1>Musira, la musique de ta soirée par tous, pour tous</h1>
          <p>
            Crée une session, connecte ton compte Spotify Premium et laisse tes
            invités proposer et voter pour les meilleurs sons. La file d'attente
            s'adapte en temps réel.
          </p>
          <div class="cta">
            <button (click)="createSession()">Créer une session</button>
          </div>
        </div>
        <div class="card join-card">
          <h2>Rejoindre une session</h2>
          <p class="muted">
            Tu auras besoin du code de session, demande-le à l'organisateur
          </p>
          <form [formGroup]="form" (ngSubmit)="joinSession()">
            <label for="code" class="muted">Code de session</label>
            <div
              style="display:flex; gap: 8px; align-items: center; margin-top: 8px;"
            >
              <input
                id="code"
                type="text"
                (input)="onInputChange($event)"
                name="code"
                formControlName="code"
                placeholder="123-456-789"
              />
              <button type="submit" [disabled]="form.invalid">
                Rejoindre une session
              </button>
            </div>
          </form>
          @if (form.controls.code.invalid && form.controls.code.touched) {
            <div id="form-error" class="error">
              Le code de session doit comporter 9 chiffres.
            </div>
          }
          @if (joinSessionError) {
            <div class="error">{{ joinSessionError }}</div>
          }
        </div>
      </section>

      @if (hasSessionHistory) {
        <section style="margin-top: 32px;">
          <h2 class="mt-16 mb-8">Historique des sessions</h2>
          <div class="grid">
            @for (session of sessionHistory; track session.musicSession.code) {
              <a
                class="history-card"
                (click)="joinSessionWithCode(session.musicSession.code)"
              >
                <div class="title">🎉 {{ session.musicSession.name }}</div>
                <div class="meta">
                  par <strong>{{ session.musicSession.creator }}</strong>
                </div>
                <div class="date">
                  Rejoint le {{ formatDate(session.access_date) }}
                </div>
                <div class="code">
                  #{{ formatCode(session.musicSession.code) }}
                </div>
              </a>
            }
          </div>
        </section>
      }
    </main>
  `,
})
export class LandingComponent {
  constructor(
    @Inject(MusicSessionsService)
    private readonly musicSessions: MusicSessionsService,
    @Inject(Router) private readonly router: Router,
    @Inject(AuthModalService) private readonly authModal: AuthModalService,
    @Inject(AuthenticationService)
    private readonly auth: AuthenticationService,
  ) {}

  form = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(11),
      Validators.maxLength(11),
      Validators.pattern('[0-9-]*'),
    ]),
  });

  joinSessionError = '';

  get isLoggedIn() {
    return this.auth.loggedUser().isLoggedIn;
  }

  createSession() {
    if (this.isLoggedIn) {
      this.router.navigate(['create-session']);
      return;
    }
    this.authModal.open('login', () =>
      this.router.navigate(['create-session']),
    );
    return;
  }

  scrollToJoin() {
    // No-op; single page layout already shows join card
  }

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
      { locale: 'fr-FR' },
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
