import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { AdminSeedService } from './admin-seed.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoginController } from './social/login/login.controller';
import { EmailUser } from './user.email.entity';
import { SocialLoginUser } from './user.social-login.entity';
import { RefreshController } from './email/refresh/refresh.controller';
import { UnlockController } from './email/unlock/unlock.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailUser, SocialLoginUser])],
  providers: [UsersService, AdminSeedService, AuthService],
  controllers: [
    UsersController,
    LoginController,
    RefreshController,
    UnlockController,
  ],
  exports: [UsersService],
})
export class UsersModule {}
