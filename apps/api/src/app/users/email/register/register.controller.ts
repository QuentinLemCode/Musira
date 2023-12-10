import { type EmailRegisterInterface } from '@musira/api-interfaces/user/email.dto';
import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../../../users/users.service';
import { EmailUserResponseDTO } from '@musira/api-interfaces/index';
import { JwtService } from '../../../users/jwt/jwt.service';

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
