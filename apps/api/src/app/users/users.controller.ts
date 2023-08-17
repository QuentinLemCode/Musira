import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { Roles } from './roles.decorator';
import { UserRole } from './user.entity';
import { UsersService } from './users.service';
import { JwtGuard } from './jwt/jwt.guard';
import { RolesGuard } from './roles.guard';

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
