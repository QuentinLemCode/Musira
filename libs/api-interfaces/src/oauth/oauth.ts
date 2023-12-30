export const OAuthProvider = {
  FACEBOOK: 'facebook',
  SPOTIFY: 'spotify',
  GOOGLE: 'google',
} as const;

export type OAuthProviderType =
  (typeof OAuthProvider)[keyof typeof OAuthProvider];

export const isOAuthProvider = (
  provider: unknown,
): provider is OAuthProviderType => {
  if (typeof provider !== 'string') return false;
  return Object.values(OAuthProvider).includes(provider as OAuthProviderType);
};
