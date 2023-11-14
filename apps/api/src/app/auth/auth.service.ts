import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import type { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  validateUser(email: string, password: string): Promise<User | null> {
    return this.users.emailLogin({ email, password });
  }
}
