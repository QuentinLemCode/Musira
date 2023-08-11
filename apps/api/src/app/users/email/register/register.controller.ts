import { type EmailRegisterInterface } from '@musira/api-interfaces/user/email.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { EmailUserResponseDTO } from '@musira/api-interfaces/index';

@Controller('users/email/register')
export class EmailController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() infos: EmailRegisterInterface,
  ): Promise<EmailUserResponseDTO> {
    const user = await this.usersService.emailRegister(infos);
    return new EmailUserResponseDTO(
      user.name,
      user.id,
      user.created_at.toISOString(),
      user.updated_at.toISOString(),
      user.sessionCreatedIds,
      0,
      user.role,
      user.email,
      '',
      '',
      user.locked,
      user.loginTries,
    );
  }
}
