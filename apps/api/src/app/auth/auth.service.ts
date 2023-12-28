import type { JwtPayload } from '@musira/api-interfaces/index';
import { Injectable } from '@nestjs/common';
import { UserRole, type User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  validateUser(email: string, password: string): Promise<User | null> {
    return this.users.emailLogin({ email, password });
  }

  login(user: User) {
    const payload: JwtPayload = {
      context: {
        user: {
          email: user.email,
          name: user.name,
          admin: user.role === UserRole.ADMIN,
        },
      },
    };
    return {
      access_token: 'dumb',
      // access_token: this.jwtService.sign(payload),
      user: payload.context.user,
    };
  }
}
