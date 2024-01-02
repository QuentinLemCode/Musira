import type { OAuthProviderType } from '@musira/api-interfaces';
import { Body, Controller, Inject, Post, Res } from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { AuthService } from '../auth.service';
import { OAuthService } from './oauth.service';
import { Public } from '../public-routes.decorator';

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
