import type { SocialUser } from '@abacritt/angularx-social-login';
import {
  FacebookLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { SocialLoginUserDTO } from '@musira/api-interfaces/index';
import { Router } from '@angular/router';

@Component({
  selector: 'musira-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(SocialAuthService) private readonly authService: SocialAuthService,
    @Inject(UserService) private readonly userService: UserService,
    @Inject(Router) private readonly router: Router,
  ) {}

  user: SocialUser | null = null;
  $authState?: Subscription;

  ngOnInit(): void {
    this.$authState = this.authService.authState.subscribe((user) => {
      if (user === null) return;
      this.userService
        .socialLogin(new SocialLoginUserDTO(user), user.idToken)
        .subscribe(() => {
          this.router.navigate(['/']);
        });
    });
  }

  ngOnDestroy(): void {
    this.$authState?.unsubscribe();
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

  signOut(): void {
    this.authService.signOut();
  }
}
