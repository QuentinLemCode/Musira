import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { env } from 'process';
import { UsersService } from 'src/users/users.service';
import { UserRole } from '../users/user.entity';
import { hashPassword } from '../utils/hash';
import { RefreshTokenPayload, TokenPayload, UserLogin } from './auth.interface';

@Injectable()
export class AuthService {
  private readonly refreshTokenOptions: JwtSignOptions = {
    secret: env.JWT_REFRESH_SECRET ?? randomBytes(16).toString('base64'),
    expiresIn: env.JWT_REFRESH_EXPIRATION ?? '1y',
  };

  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(
    name: string,
    ip: string,
    password?: string,
    challenge?: string,
  ) {
    const user = await this.users.find(name);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.locked) {
      throw new ForbiddenException({ cause: 'locked' });
    }
    if (user?.role === UserRole.ADMIN) {
      if (!password) {
        throw new ForbiddenException({ cause: 'password' });
      }
      if (password && hashPassword(password, user?.salt) === user?.password) {
        return user;
      } else {
        throw new ForbiddenException({ cause: 'password' });
      }
    }
    if (user?.noIPverification && !challenge) {
      await this.users.addLoginTry(user);
      throw new ForbiddenException({ cause: 'challenge' });
    }
    if (user?.ip === ip) {
      await this.users.resetLoginTry(user);
      return user;
    }
    if (challenge && user.challenge === hashPassword(challenge, user.salt)) {
      await this.users.resetLoginTry(user);
      await this.users.saveIp(user, ip);
      return user;
    }
    this.users.addLoginTry(user);
    throw new ForbiddenException({ cause: 'challenge' });
  }

  async login(user: any, refreshToken?: string): Promise<UserLogin> {
    const payload: TokenPayload = {
      username: user.name,
      sub: user.id,
      role: user.role,
    };
    const token = this.jwt.sign(payload);
    const expirationTimestamp = (
      this.jwt.decode(token, { complete: true }) as any
    )?.payload?.exp;
    return {
      access_token: token,
      id: user.id,
      refresh_token: refreshToken ?? (await this.generateRefreshToken(user.id)),
      expires_at: expirationTimestamp,
      username: user.name,
      role: user.role === UserRole.ADMIN ? 'admin' : 'user',
    };
  }

  async createAccessTokenFromRefreshToken(refreshToken: string) {
    const decoded: RefreshTokenPayload = this.jwt.decode(
      refreshToken,
    ) as RefreshTokenPayload;
    if (!decoded) {
      throw new Error();
    }
    const user = await this.users.findById(decoded.userId);
    if (!user) {
      throw new NotFoundException('User with this id does not exist');
    }
    const isRefreshTokenMatching = user.refresh_token_id === decoded.id;
    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException({ cause: 'refresh-token' });
    }
    try {
      await this.jwt.verifyAsync(refreshToken, this.refreshTokenOptions);
    } catch (err) {
      throw new UnauthorizedException({ cause: 'refresh-token' });
    }
    return this.login(user, refreshToken);
  }

  async logout(userId: number) {
    await this.users.removeRefreshUUID(userId);
  }

  private async generateRefreshToken(userId: number) {
    const uuid = await this.users.generateRefreshUUID(userId);
    const payload: RefreshTokenPayload = {
      id: uuid,
      userId,
    };
    return this.jwt.sign(payload, this.refreshTokenOptions);
  }
}
