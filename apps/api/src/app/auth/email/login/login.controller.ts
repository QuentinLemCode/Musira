import type { JwtUser } from '@musira/api-interfaces/index';
import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { EmailUser } from '../../../users/user.email.entity';
import { AuthService } from '../../auth.service';
import { JwtGuard } from '../../jwt.guard';
import { LocalAuthGuard } from '../../local-auth.guard';

@Controller('auth/email')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request() req: { user: EmailUser },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.authService.login(req.user, res);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req: { user: JwtUser }) {
    return req.user;
  }
}
