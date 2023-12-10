import { Controller, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../../users.service.js';
import { Roles } from '../../roles.decorator.js';
import { UserRole } from '../../user.entity.js';
import { JwtGuard } from '../../jwt/jwt.guard.js';
import { RolesGuard } from '../../roles.guard.js';

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
