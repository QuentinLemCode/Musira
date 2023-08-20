import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { JwtService } from '../../jwt/jwt.service';
import { EmailRefreshResponseDTO } from '@musira/api-interfaces/index';

@Controller('users/email/refresh')
export class RefreshController {
  constructor(private readonly jwt: JwtService) {}

  @Post()
  async refresh(
    @Body() body: { token: string },
  ): Promise<EmailRefreshResponseDTO> {
    if (!body?.token) {
      throw new BadRequestException('no token');
    }
    const refresh = await this.jwt.createAccessTokenFromRefreshToken(
      body.token,
    );
    return new EmailRefreshResponseDTO(
      refresh.access_token,
      refresh.refresh_token,
      refresh.expires_at,
    );
  }
}
