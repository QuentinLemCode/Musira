export const OAuthProvider = {
  FACEBOOK: 'facebook',
  SPOTIFY: 'spotify',
  GOOGLE: 'google',
} as const;

export type OAuthProviderType =
  (typeof OAuthProvider)[keyof typeof OAuthProvider];
