export interface SocialUserDTO {
  provider: string;
  email: string;
  name: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
}

export class SocialUserLoginDTO implements SocialUserDTO {
  constructor(socialUser: SocialUserDTO) {
    this.provider = socialUser.provider;
    this.email = socialUser.email;
    this.name = socialUser.name;
    this.photoUrl = socialUser.photoUrl;
    this.firstName = socialUser.firstName;
    this.lastName = socialUser.lastName;
  }
  provider: string;
  email: string;
  name: string;
  photoUrl: string;
  firstName: string;
  lastName: string;

  isValid() {
    return (
      this.provider &&
      this.email &&
      this.name &&
      this.photoUrl &&
      this.firstName &&
      this.lastName
    );
  }
}

export type UserLoginResponseDTO = (SocialUserLogin | EmailUserLogin) & {
  token: string;
  username: string;
  userId: number;
  sessionsCreator: string[];
  expiresAt: number;
  role: string;
};

interface SocialUserLogin {
  type: 'SOCIAL';
  provider: string;
}

interface EmailUserLogin {
  type: 'EMAIL';
  email: string;
  refreshToken: string;
}
