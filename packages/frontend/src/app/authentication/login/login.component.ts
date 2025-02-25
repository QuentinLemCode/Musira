import { Component, Inject, effect } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faGoogle, faMicrosoft } from '@fortawesome/free-brands-svg-icons';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { OAuthProvider } from '@musira/api';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'musira-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    @Inject(AuthenticationService) private readonly auth: AuthenticationService,
    @Inject(Router) private readonly router: Router,
  ) {
    effect(() => {
      if (this.auth.loggedUser().isLoggedIn) this.router.navigate(['/']);
    });
  }

  faCircle = faCircleNotch;
  faGoogle = faGoogle;
  faMicrosoft = faMicrosoft;
  emailLogin = false;
  loading = false;
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(64),
    ]),
  });
  error = '';

  submit() {
    if (
      this.form.invalid ||
      !this.form.value.email ||
      !this.form.value.password
    ) {
      return;
    }
    this.loading = true;
    this.auth
      .emailLogin(this.form.value.email, this.form.value.password)
      .subscribe({
        next: () => {
          this.loading = false;
        },
        error: (err) => {
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
