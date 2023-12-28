import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { passportJwtSecret } from 'jwks-rsa';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri:
          'https://dev-17p01l3m4bw5jef5.us.auth0.com/.well-known/jwks.json',
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: '03Vk8RcQzSiQOuHQR4reEi74jEhBsHZw', //optional!
      issuer: 'https://dev-17p01l3m4bw5jef5.us.auth0.com/',
      algorithms: ['RS256'],
    });
  }
  validate(payload: unknown): unknown {
    return payload;
  }
}
