import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import type { User } from '../../../users/user.entity';
import { LocalAuthGuard } from '../../local-auth.guard';
import { AuthService } from '../../auth.service';
import { JwtGuard } from '../../jwt.guard';
import type { JwtUser } from '../../jwt-user';

@Controller('auth/email')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: { user: User }) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtGuard)
  @Get('profile')
  getProfile(@Request() req: { user: JwtUser }) {
    return req.user;
  }
}
