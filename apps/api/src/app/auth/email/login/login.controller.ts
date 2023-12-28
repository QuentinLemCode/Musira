import { Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import type { User } from '../../../users/user.entity';
import { AuthService } from '../../auth.service';
import { JwtGuard } from '../../jwt.guard';
import { LocalAuthGuard } from '../../local-auth.guard';
import type { FastifyReply } from 'fastify';
import type { JwtUser } from '@musira/api-interfaces/index';

@Controller('auth/email')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request() req: { user: User },
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
