import { Body, Controller, NotFoundException, Post } from '@nestjs/common';
import { UsersService } from '../../users.service';
import {
  EmailLoginInterface,
  EmailUserResponseDTO,
} from '@musira/api-interfaces/index';

@Controller('users/email/login')
export class LoginController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() infos: EmailLoginInterface,
  ): Promise<EmailUserResponseDTO> {
    const user = await this.usersService.emailLogin(infos);
    if (user === null) {
      throw new NotFoundException('User not found');
    }
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
