import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { UsersService } from '../../users.service.js';
import {
  type EmailLoginInterface,
  EmailUserResponseDTO,
} from '#api-interfaces/index.js';
import { JwtService } from '../../jwt/jwt.service.js';

@Controller('users/email/login')
export class LoginController {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  @Post()
  async create(
    @Body() infos: EmailLoginInterface,
  ): Promise<EmailUserResponseDTO> {
    const user = await this.users.emailLogin(infos);
    if (user === null) {
      throw new NotFoundException('User not found');
    }
    const token = await this.jwt.generateEmailToken(user);
    return new EmailUserResponseDTO(
      user.name,
      user.id,
      user.created_at.toISOString(),
      user.updated_at.toISOString(),
      (await user.sessionCreated).map((s) => s.publicCode) || [],
      token.expires_at,
      user.role,
      user.email,
      token.access_token,
      token.refresh_token,
      user.locked,
      user.loginTries,
    );
  }
}
