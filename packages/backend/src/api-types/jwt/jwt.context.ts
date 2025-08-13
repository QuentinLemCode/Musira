export interface JwtUser {
  id: number;
  admin: boolean;
  email: string;
  name: string;
  role: number;
}

export interface JwtContext {
  user: JwtUser;
}

export interface JwtPayload {
  context: JwtContext;
}

export interface JwtToken {
  accessToken: string;
}
