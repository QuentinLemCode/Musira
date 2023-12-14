import type { JwtPayload } from '@musira/api-interfaces/index';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { FastifyRequest } from 'fastify';
import { jwtSecret } from './secret';
import { ExtractJwt, Strategy } from 'passport-jwt';

// overriding passport-jwt not available for fastify
declare module 'passport-jwt' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ExtractJwt {
    export interface JwtFromRequestFunction {
      (req: FastifyRequest): string | null;
    }
  }
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    return { ...payload.context.user };
  }

  private static extractFromCookie(req: FastifyRequest): string | null {
    return req.cookies?.token ?? null;
  }
}
