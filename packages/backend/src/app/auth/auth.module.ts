import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginController } from './email/login/login.controller';
import { LogoutController } from './email/logout/logout.controller';
import { RegisterController } from './email/register/register.controller';
import { UnlockController } from './email/unlock/unlock.controller';
import { JwtGuard } from './jwt.guard';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { OauthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';
import { jwtSecret } from './secret';

@Module({
  imports: [
    UsersModule,
    // register() (even with empty options) provides the AuthModuleOptions
    // token that @nestjs/passport@12's AuthGuard mixin injects. A bare
    // PassportModule import leaves the token unprovided, which breaks guard
    // instantiation (swagger deep scans, per-request @UseGuards).
    PassportModule.register({}),
    JwtModule.register({
      verifyOptions: {
        algorithms: ['HS256'],
        issuer: 'musira',
        audience: 'musira',
      },
      secret: jwtSecret,
      signOptions: {
        expiresIn: '7d',
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
