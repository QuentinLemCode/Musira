import { Controller, Get, Request } from '@nestjs/common';
import type { JwtUser } from '../../api-types/jwt/jwt.context';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@Request() req: { user: JwtUser }) {
    return req.user;
  }
}
