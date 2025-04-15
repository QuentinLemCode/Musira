import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LoginController } from './email/login/login.controller';
import { LogoutController } from './email/logout/logout.controller';
import { RegisterController } from './email/register/register.controller';
import { UnlockController } from './email/unlock/unlock.controller';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { OauthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';
import { jwtSecret } from './secret';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './jwt.guard';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      verifyOptions: {
        algorithms: ['HS256'],
        issuer: 'musira',
        audience: 'musira',
      },
      secret: jwtSecret,
      signOptions: {
        expiresIn: '30d',
        algorithm: 'HS256',
        issuer: 'musira',
        audience: 'musira',
      },
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    OAuthService,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  controllers: [
    LoginController,
    OauthController,
    LogoutController,
    RegisterController,
    UnlockController,
    AuthController,
  ],
})
export class AuthModule {}
