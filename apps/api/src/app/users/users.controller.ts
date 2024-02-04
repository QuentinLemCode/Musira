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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAll() {
    return this.users.getAll();
  }

  @Delete(':id?')
  async delete(@Request() req: { user: JwtUser }, @Param('id') id?: string) {
    if (id) {
      if (!req.user.admin) throw new ForbiddenException('not admin');
      await this.users.delete(+id);
    } else if (!req.user.admin) {
      await this.users.delete(req.user.id);
    } else {
      throw new ForbiddenException("An admin can't delete himself");
    }
    return;
  }
}
