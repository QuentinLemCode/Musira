import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { Repository } from 'typeorm';
import { hashPassword } from '../utils/hash';
import { User, UserRole } from './user.entity';

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  constructor(@InjectRepository(User) private users: Repository<User>) {}
  async onApplicationBootstrap() {
    let admin = await this.users.findOneBy({ role: UserRole.ADMIN });
    if (!admin) {
      const password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin';
      admin = this.users.create();
      admin.noIPverification = true;
      admin.salt = randomBytes(16).toString('base64');
      admin.password = hashPassword(password, admin.salt);
      admin.name = 'admin';
      admin.role = UserRole.ADMIN;
      this.users.save(admin);
    }
  }
}
