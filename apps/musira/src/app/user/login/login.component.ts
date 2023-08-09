import type { SocialUser } from '@abacritt/angularx-social-login';
import {
  FacebookLoginProvider,
  SocialAuthService,
} from '@abacritt/angularx-social-login';
import type { OnDestroy, OnInit } from '@angular/core';
import { Component, Inject } from '@angular/core';
import type { Subscription } from 'rxjs';

@Component({
  selector: 'musira-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(SocialAuthService) private authService: SocialAuthService,
  ) {}

  user: SocialUser | null = null;
  $authState?: Subscription;

  ngOnInit(): void {
    this.$authState = this.authService.authState.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.$authState?.unsubscribe();
  }

  async signInWithFB() {
    const user = await this.authService.signIn(
      FacebookLoginProvider.PROVIDER_ID,
    );
  }

  signOut(): void {
    this.authService.signOut();
  }
}
