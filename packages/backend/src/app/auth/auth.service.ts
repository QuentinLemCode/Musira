import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { FastifyReply } from 'fastify';
import { EmailUser } from '../users/user.email.entity';
import { UserRole } from '../users/user.entity';
import type { OAuthUser } from '../users/user.oauth.entity';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private logger = new Logger(AuthService.name);

  validateUser(email: string, password: string): Promise<EmailUser | null> {
    return this.users.emailLogin({ email, password });
  }

  login(user: EmailUser | OAuthUser, res: FastifyReply) {
    const payload: JwtPayload = {
      context: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name:
            user instanceof EmailUser
              ? (user.name ?? '')
              : `${user.firstName} ${user.lastName}`,
          admin: user.role === UserRole.ADMIN,
        },
      },
    };

    const token = this.jwtService.sign(payload, {
      subject: user.id.toString(),
    });

    const secureCookies = (process.env.COOKIE_SECURE ?? 'true') !== 'false';
    res.setCookie('access_token', token, {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days, matches the JWT expiration
    });

    return { success: true };
  }

  logout(res: FastifyReply) {
    const secureCookies = (process.env.COOKIE_SECURE ?? 'true') !== 'false';
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: secureCookies,
      sameSite: 'strict',
      path: '/',
    });
  }
}
