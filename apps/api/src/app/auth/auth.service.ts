import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import type { FastifyReply } from 'fastify';
import { EmailUser } from '../users/user.email.entity';
import { UserRole } from '../users/user.entity';
import type { OAuthUser } from '../users/user.oauth.entity';
import { UsersService } from '../users/users.service';
import { hashPassword } from '../utils/hash';
import type { JwtPayload } from '@musira/api-interfaces';

@Injectable()
export class AuthService {
  private signatureSecret =
    process.env.JWT_SIGNATURE_SECRET || 'notreallysecret';
  constructor(
    private readonly users: UsersService,
    private readonly jwtService: JwtService,
  ) {}

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
              ? user.name
              : `${user.firstName} ${user.lastName}`,
          admin: user.role === UserRole.ADMIN,
        },
      },
    };
    const jwtid = randomUUID();
    const signature = this.generateSignature(jwtid);
    res.setCookie('signature', signature, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // valid 30 days
      secure: true,
      sameSite: 'strict',
    });
    const token = this.jwtService.sign(payload, {
      jwtid,
      subject: user.id.toString(),
    });
    return { accessToken: token };
  }

  logout(res: FastifyReply) {
    res.clearCookie('signature');
  }

  verifySignature(jwtId: string, signature: string) {
    return hashPassword(jwtId, this.signatureSecret) === signature;
  }

  private generateSignature(jwtId: string) {
    return hashPassword(jwtId, this.signatureSecret);
  }
}
