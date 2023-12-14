export interface JwtUser {
  role: number;
  email: string;
  name: string;
}

export interface JwtContext {
  user: JwtUser;
}

export interface JwtPayload {
  context: JwtContext;
}
