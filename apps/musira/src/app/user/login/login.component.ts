import { Component, OnDestroy, OnInit } from '@angular/core';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

@Component({
  selector: 'musira-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(private authService: SocialAuthService) {}

  user: SocialUser | null = null;
  $authState?: Subscription;

  ngOnInit(): void {
    this.$authState = this.authService.authState.subscribe((user) => {
      console.log(user);
      this.user = user;
    });
  }

  ngOnDestroy(): void {
    this.$authState?.unsubscribe();
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  signOut(): void {
    this.authService.signOut();
  }
}
