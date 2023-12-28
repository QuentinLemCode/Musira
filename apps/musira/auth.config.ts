import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://dev-17p01l3m4bw5jef5.us.auth0.com/',
  redirectUri: window.location.origin + '/index.html',
  clientId: '03Vk8RcQzSiQOuHQR4reEi74jEhBsHZw',
  oidc: true,
  scope: 'openid profile email offline_access',
  responseType: 'code',
  showDebugInformation: true,
  tokenEndpoint: 'https://dev-17p01l3m4bw5jef5.us.auth0.com/oauth/token',
};
