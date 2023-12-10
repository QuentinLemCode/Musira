import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator.js';
import { UserRole } from './user.entity.js';
import { UsersService } from './users.service.js';
import { JwtGuard } from './jwt/jwt.guard.js';
import { RolesGuard } from './roles.guard.js';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAll() {
    return this.users.getAll();
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.users.delete(+id);
    return this.getAll();
  }
}
