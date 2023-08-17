import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';

@Controller('users/email/refresh')
export class RefreshController {
  constructor(private readonly jwt: JwtService) {}

  @Post()
  async refresh(@Body() body: { token: string }) {
    if (!body?.token) {
      throw new BadRequestException('no token');
    }
    return this.jwt.createAccessTokenFromRefreshToken(body.token);
  }
}
