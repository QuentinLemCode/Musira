import { Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { EmailUser } from '../../../users/user.email.entity';
import { AuthService } from '../../auth.service';
import { LocalAuthGuard } from '../../local-auth.guard';

@Controller('auth/email/login')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post()
  login(
    @Request() req: { user: EmailUser },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.authService.login(req.user, res);
  }
}
