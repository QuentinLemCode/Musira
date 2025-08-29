import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthService } from '../auth.service';
import { Public } from '../public-routes.decorator';
import type { OAuthProviderType } from '../types';
import { OAuthService } from './oauth.service';

@Controller('auth/oauth')
export class OauthController {
  @Inject(OAuthService) private readonly oauth: OAuthService;
  @Inject(AuthService) private readonly auth: AuthService;

  @Public()
  @Post('login')
  async login(
    @Body('provider') provider: OAuthProviderType,
    @Body('code') code: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const user = await this.oauth.login(provider, code);
    return this.auth.login(user, res);
  }
}
