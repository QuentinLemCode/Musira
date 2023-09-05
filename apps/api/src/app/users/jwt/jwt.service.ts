import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { JWTPayload } from 'jose';
import { SignJWT, createRemoteJWKSet, jwtVerify } from 'jose';
import { env } from 'process';
import { type User } from '../user.entity';
import { UsersService } from '../users.service';

enum IssuerType {
  GOOGLE,
  FACEBOOK,
  EMAIL,
}

@Injectable()
export class JwtService {
  private readonly jwtAlgorithm = 'HS256';
  private readonly LOGGER = new Logger(JwtService.name);

  private readonly refreshTokenSecret: Uint8Array;
  private readonly accessTokenSecret: Uint8Array;

  private facebookJWKS = createRemoteJWKSet(
    new URL('https://www.facebook.com/.well-known/oauth/openid/jwks/'),
  );
  private googleJWKS = createRemoteJWKSet(
    new URL('https://www.googleapis.com/oauth2/v3/certs'),
  );

  constructor(private readonly users: UsersService) {
    this.refreshTokenSecret = this.encodeSecret(
      env.JWT_REFRESH_SECRET ?? randomBytes(16).toString('base64'),
    );
    this.accessTokenSecret = this.encodeSecret(
      env.JWT_SECRET ?? randomBytes(16).toString('base64'),
    );
  }

  validateToken(token: string) {
    const decoded = this.decodeToken(token);
    if (!this.isValidPayload(decoded)) {
      throw new UnauthorizedException({ cause: 'token' });
    }
    switch (this.jwtIssuer(decoded.iss)) {
      case IssuerType.GOOGLE:
        return this.validateGoogleToken(token);
      case IssuerType.FACEBOOK:
        return this.validateFacebookToken(token);
      case IssuerType.EMAIL:
        return this.validateEmailToken(token);
      default:
        throw new UnauthorizedException({ cause: 'issuer' });
    }
  }

  async validateGoogleToken(token: string) {
    return (await jwtVerify(token, this.googleJWKS)).payload;
  }

  async validateFacebookToken(token: string) {
    return (await jwtVerify(token, this.facebookJWKS)).payload;
  }

  async validateEmailToken(token: string) {
    try {
      return (
        await jwtVerify(token, this.accessTokenSecret, {
          algorithms: [this.jwtAlgorithm],
        })
      ).payload;
    } catch (error) {
      throw new UnauthorizedException({ cause: 'token' });
    }
  }

  async generateEmailToken(user: User) {
    const issuer = env.ORIGIN || 'email';
    const token = await new SignJWT({
      email: user.email,
      iss: issuer,
      role: user.role,
    })
      .setProtectedHeader({ alg: this.jwtAlgorithm })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(this.accessTokenSecret);
    const decoded = this.decodeToken(token);
    if (decoded === null || typeof decoded.payload === 'string' || !decoded.exp)
      throw new InternalServerErrorException('Error while crafting token');
    return {
      access_token: token,
      refresh_token: await this.generateRefreshToken(user.id),
      expires_at: decoded.exp,
    };
  }

  private jwtIssuer(issuer: string): IssuerType {
    switch (issuer) {
      case 'https://accounts.google.com':
        return IssuerType.GOOGLE;
      // TODO : update this
      case 'facebook':
        return IssuerType.FACEBOOK;
      case env.ORIGIN:
      case 'email':
        return IssuerType.EMAIL;
      default:
        throw new UnauthorizedException({ cause: 'issuer' });
    }
  }

  async generateRefreshToken(userId: number) {
    const uuid = await this.users.generateRefreshUUID(userId);
    const payload: JWTPayload = {
      id: uuid,
      userId,
    };
    return new SignJWT(payload)
      .setProtectedHeader({ alg: this.jwtAlgorithm })
      .setIssuedAt()
      .setExpirationTime('1y')
      .sign(this.refreshTokenSecret);
  }

  async createAccessTokenFromRefreshToken(refreshToken: string) {
    const decoded = await jwtVerify(refreshToken, this.refreshTokenSecret);
    if (!decoded.payload.userId || !decoded.payload.id) {
      throw new UnauthorizedException({ cause: 'refresh-token' });
    }
    const user = await this.users.findEmailUserById(+decoded.payload.userId);
    if (!user) {
      throw new NotFoundException('User with this id does not exist');
    }
    const isRefreshTokenMatching = user.refresh_token_id === decoded.payload.id;
    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException({ cause: 'refresh-token' });
    }
    return this.generateEmailToken(user);
  }

  private isValidPayload(
    payload: JWTPayload,
  ): payload is { email: string; iss: string } {
    if (typeof payload === 'string') {
      return false;
    }
    if (payload === null) {
      return false;
    }
    if (typeof payload.email !== 'string') {
      return false;
    }
    if (typeof payload.iss !== 'string') {
      return false;
    }
    return true;
  }

  private decodeToken(token: string) {
    const payload = token.split('.')[1];
    if (!payload) {
      throw new UnauthorizedException({ cause: 'token' });
    }
    try {
      return JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'));
    } catch {
      throw new UnauthorizedException({ cause: 'token' });
    }
  }

  private encodeSecret(secret: string) {
    return new TextEncoder().encode(secret);
  }
}
