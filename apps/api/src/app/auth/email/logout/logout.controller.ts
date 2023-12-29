import {
  BadRequestException,
  Controller,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { UsersService } from '../../../users/users.service';
import { AuthService } from '../../auth.service';

@Controller('auth/email/logout')
export class LogoutController {
  constructor(
    private readonly authService: AuthService,
    private readonly user: UsersService,
  ) {}

  @Post(':id')
  async logout(
    @Param('id') id: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (!id) {
      throw new BadRequestException('bad params');
    }
    await this.user.removeRefreshUUID(+id);
    return this.authService.logout(res);
  }
}
