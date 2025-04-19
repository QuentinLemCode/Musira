import type { JwtUser } from '@musira/api';
import { Controller, Get, Request } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Request() req: { user: JwtUser }) {
    return req.user;
  }
}
