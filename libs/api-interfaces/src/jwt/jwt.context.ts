export interface JwtUser {
  admin: boolean;
  email: string;
  name: string;
}

export interface JwtContext {
  user: JwtUser;
}

export interface JwtPayload {
  context: JwtContext;
}
