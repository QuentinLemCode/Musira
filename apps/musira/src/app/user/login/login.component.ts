import {
  FacebookLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import { Component, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
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
    @Inject(UserService) private readonly userService: UserService,
    @Inject(Router) private readonly router: Router,
  ) {
    this.userService.userLogin$.pipe(takeUntilDestroyed()).subscribe((user) => {
      if (user === null) return;
      this.router.navigate(['/']);
    });
  }

  async signInWithFB() {
    const user = await this.authService.signIn(
      FacebookLoginProvider.PROVIDER_ID,
    );
    if (user) {
      this.userService
        .socialLogin(new SocialLoginUserDTO(user), user.idToken)
        .subscribe();
    }
  }
}
