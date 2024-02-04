import { Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '../../../users/user.entity';
import { UsersService } from '../../../users/users.service';
import { Roles } from '../../roles.decorator';
import { RolesGuard } from '../../roles.guard';

@Controller('auth/email/unlock')
export class UnlockController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id')
  async unlock(@Param('id') id: string) {
    await this.users.unlock(+id);
    return this.users.getAll();
  }
}
