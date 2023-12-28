import { Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../../../users/users.service';
import { Roles } from '../../../users/roles.decorator';
import { UserRole } from '../../../users/user.entity';
import { RolesGuard } from '../../../users/roles.guard';
import { JwtGuard } from '../../jwt.guard';

@Controller('auth/email/unlock')
export class UnlockController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id')
  async unlock(@Param('id') id: string) {
    await this.users.unlock(+id);
    return this.users.getAll();
  }
}
