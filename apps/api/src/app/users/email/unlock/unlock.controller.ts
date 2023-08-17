import { Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../../users.service';
import { Roles } from '../../roles.decorator';
import { UserRole } from '../../user.entity';
import { JwtGuard } from '../../jwt/jwt.guard';
import { RolesGuard } from '../../roles.guard';

@Controller('users/email/unlock')
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
