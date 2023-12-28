import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSeedService } from './admin-seed.service';
import { JwtService } from './jwt/jwt.service';
import { EmailUser } from './user.email.entity';
import { User } from './user.entity';
import { OAuthUser } from './user.oauth.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, EmailUser, OAuthUser])],
  providers: [UsersService, AdminSeedService, JwtService],
  controllers: [UsersController],
  exports: [UsersService, JwtService],
})
export class UsersModule {}
