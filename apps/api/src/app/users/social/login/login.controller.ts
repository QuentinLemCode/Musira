import {
  SocialLoginUserDTO,
  SocialLoginUserInterface,
  SocialUserResponseDTO,
} from '@musira/api-interfaces/index';
import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import { UsersService } from '../../users.service';

@Controller('users/social/login')
export class LoginController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  private readonly logger = new Logger('LoginController');

  @Post()
  async login(
    @Body() body: SocialLoginUserInterface,
  ): Promise<SocialUserResponseDTO> {
    const socialUser = new SocialLoginUserDTO(body);
    if (!socialUser.isValid()) throw new BadRequestException('Invalid body');
    const user = await this.users.socialLogin(socialUser);
    return new SocialUserResponseDTO(
      user.name,
      user.id,
      user.created_at.toISOString(),
      user.updated_at.toISOString(),
      user.sessionCreatedIds,
      0,
      user.role,
      user.provider,
      'SOCIAL',
    );
  }
}
