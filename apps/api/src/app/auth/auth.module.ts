import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LoginController } from './email/login/login.controller';
import { LocalStrategy } from './local.strategy';
import { jwtSecret } from './secret';
import { JwtStrategy } from './jwt.strategy';
import { OAuthService } from './oauth/oauth.service';
import { OauthController } from './oauth/oauth.controller';

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
  providers: [AuthService, LocalStrategy, JwtStrategy, OAuthService],
  controllers: [LoginController, OauthController],
})
export class AuthModule {}
