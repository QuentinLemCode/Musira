import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import {
  provideRouter,
  RouterStateSnapshot,
  TitleStrategy,
} from '@angular/router';

import { provideClientHydration } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { provideApi } from '../generated/provide-api';
import { routes } from './app.routes';
import { AuthenticationService } from './authentication/authentication.service';
import { withCredentialsInterceptor } from './shared/with-credentials.interceptor';
class MusiraTitleStrategy extends TitleStrategy {
  constructor(private readonly pageTitle: Title) {
    super();
  }
  override updateTitle(snapshot: RouterStateSnapshot): void {
    const lang = this.detectLang();

    // Read deepest route data for SEO meta
    let node = snapshot.root;
    while (node.firstChild) node = node.firstChild;
    const data = (node.data ?? {}) as Record<string, unknown>;

    const defaultTitleFr = 'Musira — Sessions musicales collaboratives';
    const defaultTitleEn = 'Musira — Collaborative music sessions';
    const routeTitle = this.buildTitle(snapshot);
    const titleFromData =
      (lang === 'fr'
        ? (data['titleFr'] as string | undefined)
        : (data['titleEn'] as string | undefined)) ?? undefined;
    const title =
      titleFromData ||
      routeTitle ||
      (lang === 'fr' ? defaultTitleFr : defaultTitleEn);
    this.pageTitle.setTitle(title);
  }

  private detectLang(): 'fr' | 'en' {
    try {
      const nav = (globalThis as any)?.navigator as Navigator | undefined;
      const language = (
        nav?.language ||
        (nav?.languages?.[0] as string) ||
        'fr'
      ).toLowerCase();
      if (language.startsWith('fr')) return 'fr';
      if (language.startsWith('en')) return 'en';
      return 'fr';
    } catch {
      return 'fr';
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    // withInterceptorsFromDi is required for the class-based
    // WithCredentialsInterceptor to run: without it, cross-origin auth calls
    // (register/login/logout) are sent without credentials and the browser
    // drops the session cookie from the response.
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    withCredentialsInterceptor,
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(),
    Title,
    {
      provide: TitleStrategy,
      useFactory: () => new MusiraTitleStrategy(inject(Title)),
    },
    // Generated API paths include '/api/...'; use absolute backend basePath (no trailing slash)
    provideApi({
      basePath: environment.serverUrl.replace(/\/+$/, ''),
      withCredentials: true,
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const auth = inject(AuthenticationService);
        return () => auth.initializeAuth();
      },
    },
  ],
};
