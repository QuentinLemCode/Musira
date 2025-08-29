import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { AuthenticationService } from '../authentication.service';
enum OAuthProvider {
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  SPOTIFY = 'spotify',
  MICROSOFT = 'microsoft',
}

@Component({
  selector: 'musira-login',
  template: `
    <div class="modal-login">
      <h3>Bienvenue</h3>
      <p class="subtitle">
        Connecte-toi pour créer une session ou rejoindre tes amis
      </p>

      <div class="providers">
        <button class="provider" (click)="googleLogin()">
          <fa-icon [icon]="faGoogle"></fa-icon>
          Google
        </button>
        <button class="provider" (click)="microsoftLogin()">
          <fa-icon [icon]="faMicrosoft"></fa-icon>
          Microsoft
        </button>
      </div>

      <div class="divider"><span>ou</span></div>

      <form class="email" [formGroup]="form" (ngSubmit)="submit()">
        <input placeholder="Ton email" formControlName="email" />
        <input
          placeholder="Ton mot de passe"
          name="password"
          type="password"
          formControlName="password"
        />
        <button class="submit" [disabled]="isSubmitDisabled" type="submit">
          Se connecter
        </button>
      </form>

      @if (error) {
        <p class="error">{{ error }}</p>
      }
    </div>
  `,
  styles: [
    `
      @use '../../../colors.scss' as *;
      .modal-login {
        display: grid;
        gap: 12px;
      }
      h3 {
        margin: 0;
        font-size: 22px;
      }
      .subtitle {
        color: var(--text-light);
        margin: 0 0 8px 0;
      }
      .providers {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .provider {
        background: var(--bg-primary);
        color: var(--font-primary);
        border: 1px solid var(--surface-border);
        display: inline-flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        padding: 12px;
        border-radius: 10px;
      }
      .divider {
        text-align: center;
        color: var(--text-light);
        font-size: 12px;
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 6px;
      }
      .divider::before,
      .divider::after {
        content: '';
        display: block;
        height: 1px;
        background: var(--surface-border);
      }
      form.email {
        display: grid;
        gap: 8px;
      }
      form.email input {
        width: 100%;
      }
      .submit {
        width: 100%;
      }
      .error {
        color: #ff6b6b;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule, RouterModule],
})
export class LoginComponent {
  constructor(
    @Inject(AuthenticationService) private readonly auth: AuthenticationService,
    @Inject(Router) private readonly router: Router,
  ) {}

  faCircle = faCircleNotch;
  faGoogle = faGoogle;
  faMicrosoft = faMicrosoft;
  emailLogin = false;
  loading = false;
  submitting = false; // Nouvel état pour éviter les conflits
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(64),
    ]),
  });
  error = '';
  @Output() success = new EventEmitter<void>();

  get isSubmitDisabled() {
    return this.form.invalid || this.submitting;
  }

  submit() {
    if (
      this.isSubmitDisabled ||
      !this.form.value.email ||
      !this.form.value.password
    ) {
      return;
    }

    this.submitting = true;
    this.loading = true;
    this.error = ''; // Réinitialiser l'erreur

    this.auth
      .emailLogin(this.form.value.email, this.form.value.password)
      .subscribe({
        next: () => {
          console.log('Email login successful, redirecting');
          // Optimistic set to allow guards to pass while auth state refreshes
          this.auth.loggedUser.set({
            isLoggedIn: true,
            id: 0,
            userId: '0',
            username: 'User',
            admin: false,
          });
          this.submitting = false;
          this.loading = false;
          this.router.navigate(['/'], { replaceUrl: true });
          this.success.emit();
        },
        error: (err) => {
          this.submitting = false;
          this.loading = false;
          this.error = err.error.message;
        },
      });
  }

  fbLogin() {
    window.location.href = this.auth.loginUrl(OAuthProvider.FACEBOOK);
  }

  googleLogin() {
    window.location.href = this.auth.loginUrl(OAuthProvider.GOOGLE);
  }

  microsoftLogin() {
    window.location.href = this.auth.loginUrl(OAuthProvider.MICROSOFT);
  }
}
