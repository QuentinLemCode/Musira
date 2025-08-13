export interface JwtUser {
  id: number;
  admin: boolean;
  email: string;
  name: string;
  role: number;
}

// export enum UserRole {
//   USER = 'user',
//   ADMIN = 'admin',
// }

export type JwtPayload = {
  context: {
    user: JwtUser;
  };
};

export const OAuthProvider = {
  FACEBOOK: 'facebook',
  SPOTIFY: 'spotify',
  GOOGLE: 'google',
  MICROSOFT: 'microsoft',
} as const;

export type OAuthProviderType =
  (typeof OAuthProvider)[keyof typeof OAuthProvider];

export const isOAuthProvider = (
  provider: unknown,
): provider is OAuthProviderType => {
  if (typeof provider !== 'string') return false;
  return Object.values(OAuthProvider).includes(provider as OAuthProviderType);
};

export interface EmailRegisterInterface {
  email: string;
  password: string;
  username: string;
}

export interface EmailLoginInterface {
  email: string;
  password: string;
}

export interface MusicSessionDto {
  id: number;
  name: string;
  code: number;
  creator: string;
  linkedToSpotify: boolean;
  isCreator: boolean;
}

export interface CreateMusicSessionDto {
  name: string;
}

export interface UpdateMusicSessionDto {
  name: string;
}

export interface DeletedMusicSessionDto {
  publicCode: number;
  deleted: boolean;
}
