import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideClientHydration } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { provideApi } from '../generated/provide-api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(),
    provideApi({ basePath: environment.serverUrl, withCredentials: true }),
    // {
    //   provide: APP_INITIALIZER,
    //   multi: true,
    //   useFactory: () => {
    //     const auth = inject(AuthenticationService);
    //     return () => auth.initializeAuth();
    //   },
    // },
  ],
};
