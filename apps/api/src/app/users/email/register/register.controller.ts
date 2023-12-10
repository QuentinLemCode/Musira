import { type EmailRegisterInterface } from '#api-interfaces/index.js';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../../users.service.js';
import { EmailUserResponseDTO } from '#api-interfaces/index.js';
import { JwtService } from '../../jwt/jwt.service.js';

@Controller('users/email/register')
export class RegisterController {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  @Post()
  async create(
    @Body() infos: EmailRegisterInterface,
  ): Promise<EmailUserResponseDTO> {
    const user = await this.users.emailRegister(infos);
    if (!user) {
      throw new BadRequestException({
        cause: 'exist',
        message: 'This name or email already exists.',
      });
    }
    const token = await this.jwt.generateEmailToken(user);
    return new EmailUserResponseDTO(
      user.name,
      user.id,
      user.created_at.toISOString(),
      user.updated_at.toISOString(),
      [],
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
