import { Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../../auth/roles.guard';
import { Roles } from '../../../auth/roles.decorator';
import { UserRole } from '../../user.entity';

@Controller('users/email/unlock')
export class UnlockController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id')
  async unlock(@Param('id') id: string) {
    await this.users.unlock(+id);
    return this.users.getAll();
  }
}
