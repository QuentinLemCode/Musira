import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getClientIp } from '@supercharge/request-ip';
import type { Request } from 'express';
import { AuthService } from '../auth/auth.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from './user.entity';
import { RegisterUserDTO } from './users.interface';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService, private auth: AuthService) {}

  @Post('register')
  async register(
    @Body() registerUserDTO: RegisterUserDTO,
    @Req() request: Request,
  ) {
    const ip = getClientIp(request);
    if (!ip) {
      throw new BadRequestException('Unable to retrieve IP adress');
    }
    const isUserExisting = await this.users.find(registerUserDTO.name);
    if (isUserExisting) {
      throw new BadRequestException({ cause: 'exist' });
    }
    const user = await this.users.register(registerUserDTO, ip);
    return this.auth.login(user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAll() {
    return this.users.getAll();
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.users.delete(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/unlock')
  unlock(@Param('id') id: string) {
    return this.users.unlock(+id);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post(':id/toggle-ip-verification')
  toggleIPVerification(@Param('id') id: string) {
    return this.users.toggleIPVerification(+id);
  }
}
