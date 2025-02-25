import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
import { AuthenticationService } from './authentication/authentication.service';

const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(), AuthenticationService],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
