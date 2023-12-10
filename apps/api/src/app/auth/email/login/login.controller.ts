import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { User } from '../../../users/user.entity';

@Controller('auth/email')
export class LoginController {
  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: { user: User }) {
    return req.user;
  }
}
