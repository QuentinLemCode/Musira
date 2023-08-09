import { SocialUserDTO } from '@musira/api-interfaces/index';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { UsersService } from '../../users.service';

@Controller('users/social/login')
export class LoginController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Post()
  login(@Body() body: SocialUserDTO) {
    return this.users.socialLogin(body);
  }
}
