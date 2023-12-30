import type { JwtUser } from '@musira/api-interfaces';
import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAll() {
    return this.users.getAll();
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: { user: JwtUser }) {
    if (req.user.id !== +id && !req.user.admin) throw new ForbiddenException();
    if (req.user.admin && req.user.id === +id)
      throw new ForbiddenException('admin cannot delete himself');
    await this.users.delete(+id);
    return;
  }
}
