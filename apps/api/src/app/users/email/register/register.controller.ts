import { type EmailRegisterDTO } from '@musira/api-interfaces/user/email.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from '../../users.service';

@Controller('email')
export class EmailController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() infos: EmailRegisterDTO) {
    return this.usersService.emailRegister(infos);
  }
}
