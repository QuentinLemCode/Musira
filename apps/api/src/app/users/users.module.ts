import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSeedService } from './admin-seed.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoginController } from './social/login/login.controller';
import { LoginController as EmailLoginController } from '../auth/email/login/login.controller';
import { EmailUser } from './user.email.entity';
import { RefreshController } from '../auth/email/refresh/refresh.controller';
import { UnlockController } from '../auth/email/unlock/unlock.controller';
import { SocialLoginUser } from './user.social-login.entity';
import { LogoutController } from '../auth/email/logout/logout.controller';
import { JwtService } from './jwt/jwt.service';
import { RegisterController } from '../auth/email/register/register.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailUser, SocialLoginUser])],
  providers: [UsersService, AdminSeedService, JwtService],
  controllers: [
    UsersController,
    LoginController,
    RefreshController,
    UnlockController,
    LogoutController,
    RegisterController,
    LoginController,
    EmailLoginController,
  ],
  exports: [UsersService, JwtService],
})
export class UsersModule {}
