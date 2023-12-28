import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole, type User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import type { JwtPayload } from '@musira/api-interfaces/index';
import type { FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { hashPassword } from '../utils/hash';

@Injectable()
export class AuthService {
  private signatureSecret =
    process.env.JWT_SIGNATURE_SECRET || 'notreallysecret';
  constructor(
    private readonly users: UsersService,
    private jwtService: JwtService,
  ) {}

  validateUser(email: string, password: string): Promise<User | null> {
    return this.users.emailLogin({ email, password });
  }

  login(user: User, res: FastifyReply) {
    const payload: JwtPayload = {
      context: {
        user: {
          email: user.email,
          name: user.name,
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

  verifySignature(jwtId: string, signature: string) {
    return hashPassword(jwtId, this.signatureSecret) === signature;
  }

  private generateSignature(jwtId: string) {
    return hashPassword(jwtId, this.signatureSecret);
  }
}
