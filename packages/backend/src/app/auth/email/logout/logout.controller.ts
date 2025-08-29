import { Controller, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthService } from '../../auth.service';

@Controller('auth/logout')
export class LogoutController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  logout(@Res({ passthrough: true }) res: FastifyReply) {
    return this.authService.logout(res);
  }
}
