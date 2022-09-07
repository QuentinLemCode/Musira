import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { UserLogin } from './auth.interface';
import { AuthService } from './auth.service';
import { LocalGuard } from './local.guard';

@Controller()
export class AuthController {
  constructor(private auth: AuthService) {}

  @UseGuards(LocalGuard)
  @Post('auth/login')
  async login(@Req() req: Request): Promise<UserLogin> {
    return this.auth.login(req.user as unknown as User);
  }

  @Post('auth/logout/:id')
  async logout(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('bad params');
    }
    return this.auth.logout(+id);
  }

  @Post('auth/refresh')
  async refresh(@Body() body: { token: string }) {
    if (!body?.token) {
      throw new BadRequestException('no token');
    }
    return this.auth.createAccessTokenFromRefreshToken(body.token);
  }
}
