import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import type { JwtUser } from './jwt-user';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private jwtService: JwtService,
  ) {}

  validateUser(email: string, password: string): Promise<User | null> {
    return this.users.emailLogin({ email, password });
  }

  login(user: User) {
    const payload: JwtUser = {
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
