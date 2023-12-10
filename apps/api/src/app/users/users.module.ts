import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSeedService } from './admin-seed.service.js';
import { User } from './user.entity.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';
import { LoginController } from './social/login/login.controller.js';
import { LoginController as EmailLoginController } from './email/login/login.controller.js';
import { EmailUser } from './user.email.entity.js';
import { RefreshController } from './email/refresh/refresh.controller.js';
import { UnlockController } from './email/unlock/unlock.controller.js';
import { SocialLoginUser } from './user.social-login.entity.js';
import { LogoutController } from './email/logout/logout.controller.js';
import { JwtService } from './jwt/jwt.service.js';
import { RegisterController } from './email/register/register.controller.js';

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
