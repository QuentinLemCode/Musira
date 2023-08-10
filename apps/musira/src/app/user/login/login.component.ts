import type { SocialUser } from '@abacritt/angularx-social-login';
import {
  FacebookLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type { Subscription } from 'rxjs';
import { UserService } from '../user.service';
import { SocialUserLoginDTO } from '@musira/api-interfaces/index';

@Component({
  selector: 'musira-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(SocialAuthService) private readonly authService: SocialAuthService,
    @Inject(UserService) private readonly userService: UserService,
  ) {}

  user: SocialUser | null = null;
  $authState?: Subscription;

  ngOnInit(): void {
    this.$authState = this.authService.authState.subscribe((user) => {
      this.userService.socialLogin(new SocialUserLoginDTO(user)).subscribe();
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
      this.userService.socialLogin(new SocialUserLoginDTO(user)).subscribe();
    }
  }

  signOut(): void {
    this.authService.signOut();
  }
}
