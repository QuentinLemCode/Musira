import { CommonModule } from '@angular/common';
import { Component, Inject, type OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../authentication.service';
function isOAuthProvider(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    ['google', 'facebook', 'spotify', 'microsoft'].includes(value)
  );
}

@Component({
  selector: 'musira-callback',
  template: `
    @if (error) {
      <p>{{ error }}</p>
    }
  `,
  styles: [``],
  standalone: true,
  imports: [CommonModule],
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
    const provider = this.provider;
    if (!isOAuthProvider(provider)) {
      this.error = 'Invalid provider';
      return;
    }
    if (state && code) {
      try {
        this.auth.oAuthLogin(provider as any, code, state).subscribe({
          next: () => {
            this.router.navigate(['/']);
          },
          error: (err) => {
            this.error = err?.error?.error || err?.error?.message;
          },
        });
        return;
      } catch (err) {
        this.error = 'Invalid request';
      }
    } else {
      this.error = 'Invalid request';
    }
  }

  get oauthData() {
    return {
      code: this.route.snapshot.queryParamMap.get('code'),
      state: this.route.snapshot.queryParamMap.get('state'),
    };
  }

  get provider() {
    return this.route.snapshot.paramMap.get('provider');
  }
}
