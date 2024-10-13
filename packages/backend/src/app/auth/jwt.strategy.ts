import type { JwtPayload } from '@musira/api';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { FastifyRequest } from 'fastify';
import { ExtractJwt, Strategy } from 'passport-jwt';
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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      algorithms: ['HS256'],
      passReqToCallback: true,
    });
  }

  validate(request: FastifyRequest, payload: JwtPayloadWithJti) {
    const signature = request.cookies.signature;
    if (!signature) {
      throw new UnauthorizedException();
    }
    const validSignature = this.auth.verifySignature(payload.jti, signature);
    if (!validSignature) {
      throw new UnauthorizedException();
    }
    return { ...payload.context.user };
  }
}
