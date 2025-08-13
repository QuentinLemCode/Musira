import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideClientHydration } from '@angular/platform-browser';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideClientHydration(),
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
