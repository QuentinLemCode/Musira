import { BadRequestException, Controller, Param, Post } from '@nestjs/common';
import { UsersService } from '../../users.service';

@Controller('users/email/logout')
export class LogoutController {
  constructor(private readonly user: UsersService) {}

  @Post(':id')
  async logout(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('bad params');
    }
    return this.user.removeRefreshUUID(+id);
  }
}
