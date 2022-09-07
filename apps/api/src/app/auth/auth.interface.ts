import { UserRole } from '../users/user.entity';

export interface UserLogin {
  access_token: string;
  refresh_token: string;
  id: number;
  username: string;
  expires_at: number;
  role: 'user' | 'admin';
}

export interface TokenPayload {
  username: string;
  sub: number;
  role: UserRole;
}

export interface RefreshTokenPayload {
  userId: number;
  id: string;
}
