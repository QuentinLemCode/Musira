import { Component, Inject, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OAuthProvider } from '@musira/api-interfaces';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'musira-callback',
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss',
})
export class CallbackComponent implements OnInit {
  constructor(
    @Inject(ActivatedRoute) private readonly route: ActivatedRoute,
    @Inject(Router) private readonly router: Router,
    @Inject(AuthenticationService) private readonly auth: AuthenticationService,
  ) {}

  error = '';

  ngOnInit(): void {
    const { code, state } = this.oauthData;
    if (state && code) {
      this.auth.oAuthLogin(OAuthProvider.FACEBOOK, code, state).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.error = err?.error?.error || err?.error?.message;
        },
      });
      return;
    }
    this.error = 'Invalid request';
  }

  get oauthData() {
    return {
      code: this.route.snapshot.queryParamMap.get('code'),
      state: this.route.snapshot.queryParamMap.get('state'),
    };
  }
}
