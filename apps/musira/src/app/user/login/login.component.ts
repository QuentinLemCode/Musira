import {
  FacebookLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { Component, Inject, effect } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { SocialLoginUserDTO } from '@musira/api-interfaces/index';
import { UserService } from '../user.service';

@Component({
  selector: 'musira-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  constructor(
    @Inject(SocialAuthService) private readonly authService: SocialAuthService,
    @Inject(UserService) private readonly users: UserService,
    @Inject(Router) private readonly router: Router,
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

  async signInWithFB() {
    const user = await this.authService.signIn(
      FacebookLoginProvider.PROVIDER_ID,
      { scope: 'email,public_profile' },
    );
    if (user) {
      this.users
        .socialLogin(new SocialLoginUserDTO(user), user.authToken)
        .subscribe();
    }
  }
}
