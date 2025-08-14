import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideClientHydration } from '@angular/platform-browser';
import { provideApi } from '../generated/provide-api';
import { routes } from './app.routes';
import { AuthenticationService } from './authentication/authentication.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(),
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
