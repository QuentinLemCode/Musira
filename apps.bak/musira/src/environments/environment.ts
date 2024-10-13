// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import type { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  serverUrl: '/api/',
  googleClientId:
    '315266048563-u7ap28p393uegvd0m8al1gbjjepoaub6.apps.googleusercontent.com',
  facebookClientId: '1003579960707915',
  spotifyClientId: '',
  microsoftClientId: '7182f84e-672a-4177-9bcb-62971ab33df0',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
