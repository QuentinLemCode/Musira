import { Component, Inject, effect } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { UserService } from '../user.service';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'musira-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    @Inject(UserService) private readonly users: UserService,
    @Inject(Router) private readonly router: Router,
    @Inject(OAuthService) private readonly oauthService: OAuthService,
  ) {
    effect(() => {
      if (this.users.loggedUser().isLoggedIn) this.router.navigate(['/']);
    });
  }

  faCircle = faCircleNotch;
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
    this.users
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

  openId() {
    this.oauthService.initLoginFlow();
  }

  profile() {
    this.users.emailProfile().subscribe();
  }

  logged() {
    this.oauthService.loadUserProfile().then((data) => {
      console.log(data);
    });
  }
}
