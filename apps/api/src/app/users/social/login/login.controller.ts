import {
  SocialUserDTO,
  SocialUserLoginDTO,
} from '@musira/api-interfaces/index';
import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { UsersService } from '../../users.service';

@Controller('users/social/login')
export class LoginController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Post()
  login(@Body() body: SocialUserDTO) {
    const socialUser = new SocialUserLoginDTO(body);
    if (!socialUser.isValid()) throw new BadRequestException('Invalid body');
    return this.users.socialLogin(socialUser);
  }
}
