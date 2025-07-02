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
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
          console.log(
            'Email login successful, updating auth state and redirecting',
          );
          // Mettre à jour l'état d'authentification manuellement
          this.auth.loggedUser.set({
            isLoggedIn: true,
            // Valeurs temporaires, seront mises à jour si checkAuthStatus() fonctionne plus tard
            id: 0,
            username: 'User',
            userId: '0',
            admin: false,
          });

          // Redirection après un délai pour éviter les conflits
          setTimeout(() => {
            console.log('Redirecting to home page');
            this.router.navigate(['/'], { replaceUrl: true });
          }, 200);
        },
        error: (err) => {
          // Différer les mises à jour d'état au prochain cycle
          setTimeout(() => {
            this.submitting = false;
            this.loading = false;
            this.error = err.error.message;
          }, 0);
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
