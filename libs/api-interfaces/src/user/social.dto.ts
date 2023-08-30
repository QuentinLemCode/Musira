export interface SocialLoginUserInterface {
  provider: string;
  email: string;
  name: string;
  photoUrl: string;
  firstName: string;
  lastName: string;
}

export class SocialLoginUserDTO implements SocialLoginUserInterface {
  constructor(socialUser: SocialLoginUserInterface) {
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
