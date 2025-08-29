import {
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import type { JwtUser } from '../auth/types';
import { UserRole } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  @ApiOperation({ summary: 'List all users (admin only)' })
  getAll() {
    return this.users.getAll();
  }

  @Delete()
  @ApiOperation({ summary: 'Delete self (non-admin only)' })
  async deleteSelf(@Request() req: { user: JwtUser }) {
    if (req.user.admin) {
      throw new ForbiddenException("An admin can't delete himself");
    }
    await this.users.delete(req.user.id);
    return;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by id (admin only)' })
  @ApiParam({ name: 'id', required: true, type: String })
  async deleteById(@Request() req: { user: JwtUser }, @Param('id') id: string) {
    if (!req.user.admin) throw new ForbiddenException('not admin');
    await this.users.delete(+id);
    return;
  }

  // Backward-compatible method for unit tests that invoked `delete(req, id?)` directly
  // Not exposed as a route
  async delete(request: { user: JwtUser }, id?: string) {
    if (id) {
      if (!request.user.admin) throw new ForbiddenException('not admin');
      await this.users.delete(+id);
      return;
    }
    if (!request.user.admin) {
      await this.users.delete(request.user.id);
      return;
    }
    throw new ForbiddenException("An admin can't delete himself");
  }
}
