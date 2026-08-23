import { Body, Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import type { EmailUser } from '../../../users/user.email.entity';
import { EmailLoginDto } from '../../dto/email-login.dto';
import { AuthService } from '../../auth.service';
import { Public } from '../../public-routes.decorator';
import { LocalAuthGuard } from '../../local-auth.guard';

@Controller('auth/email/login')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post()
  login(
    @Body() _login: EmailLoginDto,
    @Request() req: { user: EmailUser },
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    return this.authService.login(req.user, res);
  }
}
