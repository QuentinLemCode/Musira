import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { getClientIp } from '@supercharge/request-ip';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private auth: AuthService) {
    super({
      passReqToCallback: true,
      usernameField: 'name',
      passwordField: 'name',
    });
  }

  validate(request: Request, name: string) {
    const ip = getClientIp(request);
    this.logger.log(`User ${name} trying to connect with ip ${ip}`);
    if (!ip) {
      throw new BadRequestException('No adress ip received');
    }
    const password = request.body.password;
    const challenge = request.body.challenge;
    return this.auth.validateUser(name, ip, password, challenge);
  }
}
