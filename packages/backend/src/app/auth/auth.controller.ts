import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { JwtUser } from './types';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Request() req: { user: JwtUser }) {
    return req.user;
  }
}
