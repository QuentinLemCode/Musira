import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import type { OAuthProvider } from '@musira/api-interfaces/index';
import { AuthService } from '../auth.service';
import type { FastifyReply } from 'fastify';

@Controller('auth/oauth')
export class OauthController {
  @Inject(OAuthService) private readonly oauth: OAuthService;
  @Inject(AuthService) private readonly auth: AuthService;

  @Post('login')
  async login(
    @Body('provider') provider: OAuthProvider,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const user = await this.oauth.login(provider, code);
    return this.auth.login(user, res);
  }
}
