import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  provideRouter,
  RouterStateSnapshot,
  TitleStrategy,
} from '@angular/router';

import { provideClientHydration } from '@angular/platform-browser';
import { provideApi } from '../generated/provide-api';
import { routes } from './app.routes';
import { AuthenticationService } from './authentication/authentication.service';
class MusiraTitleStrategy extends TitleStrategy {
  constructor(
    private readonly pageTitle: Title,
    private readonly meta: Meta,
  ) {
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

    const defaultDescFr =
      'Organisez des sessions musicales collaboratives, ajoutez des morceaux entre amis et contrôlez la lecture ensemble. Fonctionne avec Spotify.';
    const defaultDescEn =
      'Host collaborative music sessions, queue songs with friends, and control playback together. Works with Spotify.';
    const description =
      (lang === 'fr'
        ? (data['descriptionFr'] as string | undefined)
        : (data['descriptionEn'] as string | undefined)) ??
      (data['description'] as string | undefined) ??
      (lang === 'fr' ? defaultDescFr : defaultDescEn);
    const robots = (data['robots'] as string | undefined) ?? 'index, follow';
    const ogImage =
      (data['ogImage'] as string | undefined) ??
      '/public/logo-with-title-dark.webp';

    // Standard
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });

    // Open Graph
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: 'Musira' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    const href = (globalThis?.location?.href ?? '/') as string;
    const ogImageAbs = (() => {
      try {
        return new URL(ogImage, href).toString();
      } catch {
        return ogImage;
      }
    })();
    this.meta.updateTag({ property: 'og:image', content: ogImageAbs });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({
      property: 'og:locale',
      content: lang === 'fr' ? 'fr_FR' : 'en_US',
    });
    // Canonical URL and og:url
    this.meta.updateTag({ property: 'og:url', content: href });
    try {
      const d = globalThis?.document as Document | undefined;
      if (d?.head) {
        let canonical = d.head.querySelector("link[rel='canonical']");
        if (!canonical) {
          canonical = d.createElement('link');
          canonical.setAttribute('rel', 'canonical');
          d.head.appendChild(canonical);
        }
        canonical.setAttribute('href', href);
      }
      if (d?.documentElement) d.documentElement.lang = lang;
    } catch {
      // ignore if DOM not available
    }

    // Twitter
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:site', content: '@QuentinLemCode' });
    this.meta.updateTag({
      name: 'twitter:creator',
      content: '@QuentinLemCode',
    });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImageAbs });
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
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(),
    Title,
    {
      provide: TitleStrategy,
      useFactory: () => new MusiraTitleStrategy(inject(Title), inject(Meta)),
    },
    // Generated API paths in openapi.json already include '/api/...'
    // so we keep basePath empty to avoid double '/api//api' in requests
    provideApi({ basePath: '', withCredentials: true }),
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
