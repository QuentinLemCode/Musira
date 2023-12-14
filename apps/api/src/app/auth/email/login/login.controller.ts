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
  async login(
    @Request() req: { user: User },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const token = this.authService.login(req.user);
    res.setCookie('token', token.access_token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
      sameSite: 'lax',
    });
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req: { user: JwtUser }) {
    return req.user;
  }
}
