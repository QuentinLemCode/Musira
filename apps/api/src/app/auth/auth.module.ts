import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../app/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { LoginController } from './email/login/login.controller';

@Module({
  imports: [UsersModule, PassportModule],
  providers: [AuthService, LocalStrategy],
  controllers: [LoginController],
})
export class AuthModule {}
