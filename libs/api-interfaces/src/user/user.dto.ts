interface BaseUserInterface {
  name: string;
  id: number;
  created_at: string;
  updated_at: string;
  sessionCreatedIds: number[];
  expiresAt: number;
  role: number;
}

interface SocialUserResponseInterface extends BaseUserInterface {
  type: 'SOCIAL';
  provider: string;
}

interface EmailUserResponseInterface extends BaseUserInterface {
  type: 'EMAIL';
  email: string;
  token: string;
  refreshToken: string;
  locked: boolean;
  loginTries: number;
}

export class SocialUserResponseDTO implements SocialUserResponseInterface {
  constructor(
    public name: string,
    public id: number,
    public created_at: string,
    public updated_at: string,
    public sessionCreatedIds: number[],
    public expiresAt: number,
    public role: number,
    public provider: string,
    public type: 'SOCIAL' = 'SOCIAL',
  ) {}
}

export class EmailUserResponseDTO implements EmailUserResponseInterface {
  constructor(
    public name: string,
    public id: number,
    public created_at: string,
    public updated_at: string,
    public sessionCreatedIds: number[],
    public expiresAt: number,
    public role: number,
    public email: string,
    public token: string,
    public refreshToken: string,
    public locked: boolean,
    public loginTries: number,
    public type: 'EMAIL' = 'EMAIL',
  ) {}
}

export type UserResponseDTO = SocialUserResponseDTO | EmailUserResponseDTO;
