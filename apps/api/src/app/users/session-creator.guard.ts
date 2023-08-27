import type { CanActivate, ExecutionContext } from '@nestjs/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { JWTPayload } from 'jose';
import { publicCodeFromRequest } from '../utils/decorators/music-session.decorator';
import { UsersService } from './users.service';

@Injectable()
export class SessionCreatorGuard implements CanActivate {
  constructor(
    @Inject(UsersService)
    private readonly userService: UsersService,
  ) {}

  LOGGER = new Logger(SessionCreatorGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { jwt } = context.switchToHttp().getRequest<{ jwt: JWTPayload }>();
    const email = jwt.email;
    if (!email || typeof email !== 'string') return false;

    const publicCode = publicCodeFromRequest(context);
    if (!publicCode) return false;

    return this.userService.isCreatorOfSession(email, publicCode);
  }
}
