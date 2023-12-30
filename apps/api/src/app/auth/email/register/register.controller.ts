import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Res,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { UsersService } from '../../../users/users.service';
import { AuthService } from '../../auth.service';
import type { EmailRegisterInterface } from '@musira/api-interfaces';
@Controller('auth/email/register')
export class RegisterController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersService,
  ) {}
  @Post()
  async create(
    @Body() infos: EmailRegisterInterface,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const user = await this.users.emailRegister(infos);
    if (!user) {
      throw new BadRequestException({
        cause: 'exist',
        message: 'This name or email already exists.',
      });
    }
    return this.auth.login(user, res);
  }
}
