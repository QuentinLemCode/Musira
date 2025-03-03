import type { JwtPayload } from '@musira/api';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { FastifyRequest } from 'fastify';
import { Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { jwtSecret } from './secret';

interface JwtPayloadWithJti extends JwtPayload {
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  @Inject(AuthService) private readonly auth: AuthService;
  constructor() {
    super({
      jwtFromRequest: (req: FastifyRequest) =>
        req.cookies['access_token'] ?? null,
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ['HS256'],
      passReqToCallback: true,
    });
  }

  validate(request: FastifyRequest, payload: JwtPayloadWithJti) {
    return { ...payload.context.user };
  }
}
