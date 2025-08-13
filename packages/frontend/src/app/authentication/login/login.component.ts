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
import { faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { OAuthProvider } from '@musira/api';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'musira-login',
  template: `
    <div class="login">
      <button (click)="fbLogin()">
        <fa-icon [icon]="faGoogle"></fa-icon> Se connecter avec Google
      </button>
      <button (click)="microsoftLogin()">
        <fa-icon [icon]="faMicrosoft"></fa-icon> Login with Microsoft
      </button>
      <div class="mt-4">
        <a (click)="emailLogin = !emailLogin">Se connecter avec un email</a>
      </div>

      <form *ngIf="emailLogin" [formGroup]="form" (ngSubmit)="submit()">
        <input placeholder="Ton email" formControlName="email" />
        <input
          placeholder="Ton mot de passe"
          name="password"
          type="password"
          formControlName="password"
        />
        <button [disabled]="isSubmitDisabled" type="submit">
          Se connecter
        </button>
      </form>
      <p class="error" *ngIf="error">{{ error }}</p>
    </div>
  `,
  styles: [``],
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
