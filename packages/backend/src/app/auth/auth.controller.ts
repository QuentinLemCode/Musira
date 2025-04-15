import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe() {
    return { message: 'Hello from AuthController' };
  }
}
