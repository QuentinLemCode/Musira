import type { JwtUser } from '@musira/api';
import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { publicCodeFromRequest } from '../utils/decorators/music-session.decorator';
import { UsersService } from './users.service';

@Injectable()
export class SessionCreatorGuard implements CanActivate {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
  ) {}

  logger = new Logger(SessionCreatorGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { user } = context.switchToHttp().getRequest<{ user: JwtUser }>();
    const email = user.email;
    if (!email || typeof email !== 'string') {
      this.logger.debug('invalid email : ' + email);
      return false;
    }

    const publicCode = publicCodeFromRequest(context);
    if (!publicCode) {
      this.logger.debug('invalid publicCode : ' + publicCode);
      return false;
    }

    return this.userService.isCreatorOfSession(email, publicCode);
  }
}
