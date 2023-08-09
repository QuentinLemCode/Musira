import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../auth/auth.service';
import { AdminSeedService } from './admin-seed.service';
import { User } from './user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { LoginController } from './social/login/login.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService, AdminSeedService, AuthService],
  controllers: [UsersController, LoginController],
  exports: [UsersService],
})
export class UsersModule {}
