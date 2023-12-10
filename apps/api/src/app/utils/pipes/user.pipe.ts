import {
  Injectable,
  type ArgumentMetadata,
  type PipeTransform,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { UsersService } from '../../users/users.service.js';
import type { JWTPayload } from 'jose';

@Injectable()
export class UserPipe implements PipeTransform {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async transform(value: JWTPayload, _metadata: ArgumentMetadata) {
    if (!value || !('email' in value) || typeof value.email !== 'string') {
      throw new UnauthorizedException({
        cause: 'jwt',
        message: 'invalid jwt',
      });
    }
    const user = await this.users.findByEmail(value.email);
    if (!user) {
      throw new UnauthorizedException({
        cause: 'user',
        message: 'User not found',
      });
    }
    return user;
  }
}
